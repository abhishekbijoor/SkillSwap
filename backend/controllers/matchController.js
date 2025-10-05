const User = require("../models/User");
const axios = require("axios");

// Gemini API Integration
const callGeminiAPI = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Allow model configuration via environment variable
    const modelName = process.env.GEMINI_MODEL || 'gemini-exp-1206';

    console.log(`Using Gemini model: ${modelName}`);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }
    );

    // Check if response has the expected structure
    if (!response.data) {
      throw new Error("Empty response from Gemini API");
    }

    if (!response.data.candidates || response.data.candidates.length === 0) {
      console.error("Gemini API response:", JSON.stringify(response.data, null, 2));
      throw new Error("No candidates in Gemini response - API may have blocked the request");
    }

    const text = response.data.candidates[0].content.parts[0].text;

    // Extract JSON from markdown code blocks if present
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse as direct JSON
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error Details:");
    console.error("- Status:", error.response?.status);
    console.error("- Message:", error.response?.data?.error?.message || error.message);
    console.error("- Full error:", error.response?.data || error.message);

    if (error.response?.status === 400) {
      throw new Error("Invalid API request - check API key or model name");
    } else if (error.response?.status === 429) {
      throw new Error("API quota exceeded - please try again later");
    } else if (error.response?.status === 403) {
      throw new Error("API key invalid or permissions denied");
    }

    throw new Error("Failed to get AI matching results: " + (error.response?.data?.error?.message || error.message));
  }
};

// Find skill matches
exports.findMatches = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const { skill_query, filters = {} } = req.body;

    // Get current user
    const currentUser = await User.findOne({ auth0_id });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build MongoDB query for potential matches
    const query = {
      _id: { $ne: currentUser._id },
      onboarding_completed: true,
    };

    // Filter by skill
    if (skill_query) {
      query["skills_teaching.name"] = {
        $regex: skill_query,
        $options: "i",
      };
    }

    // Filter by location if specified
    if (filters.location) {
      query["profile.location.city"] = filters.location;
    }

    // Filter by verified users only
    if (filters.verified_only) {
      query["verification.status"] = "verified";
    }

    // Get candidate users (limit to 20 for performance)
    const candidates = await User.find(query)
      .limit(20)
      .select("profile skills_teaching skills_learning verification stats");

    console.log(`Found ${candidates.length} candidates for skill query: "${skill_query}"`);

    if (candidates.length === 0) {
      console.log("No candidates found. Query:", JSON.stringify(query));
      return res.json({ matches: [], message: "No users found matching your search" });
    }

    // Prepare data for Gemini
    const candidatesData = candidates.map((user) => ({
      user_id: user._id.toString(),
      name: user.profile.name,
      skills_teaching: user.skills_teaching
        .map((s) => `${s.name} (${s.proficiency})`)
        .join(", "),
      skills_learning: user.skills_learning.map((s) => s.name).join(", "),
      verification: user.verification.status,
      avg_rating: user.stats.avg_rating || 0,
    }));

    // Construct Gemini prompt
    const prompt = `You are an expert skill-matching AI for SkillSwap, a peer-to-peer learning platform.

CURRENT USER PROFILE:
- Name: ${currentUser.profile.name}
- Skills they can teach: ${
      currentUser.skills_teaching
        .map((s) => `${s.name} (${s.proficiency}, ${s.years_experience} years)`)
        .join(", ") || "None listed"
    }
- Skills they want to learn: ${
      currentUser.skills_learning.map((s) => `${s.name} (${s.current_level}, goal: ${s.goal})`).join(", ") || "None listed"
    }
- Current rating: ${currentUser.stats.avg_rating}/5
- Search query: "${skill_query || "General matching"}"

POTENTIAL MATCHES (${candidatesData.length} candidates):
${candidatesData
  .map(
    (user, idx) => `
${idx + 1}. ID: ${user.user_id}
   Name: ${user.name}
   Can teach: ${user.skills_teaching || "None"}
   Wants to learn: ${user.skills_learning || "None"}
   Verified: ${user.verification}
   Rating: ${user.avg_rating}/5
`
  )
  .join("\n")}

MATCHING CRITERIA (prioritize in this order):
1. COMPLEMENTARY SKILLS: Match users where one teaches what the other wants to learn
2. MUTUAL BENEFIT: Both users can exchange valuable skills (bidirectional learning)
3. PROFICIENCY MATCH: Teacher should have higher proficiency than learner's current level
4. QUALITY INDICATORS: Consider ratings and verification status
5. SKILL RELEVANCE: Skills should align with the search query

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown code blocks, no explanations). Use this exact structure:
{
  "matches": [
    {
      "user_id": "exact_user_id_from_candidates_list",
      "compatibility_score": 9.2,
      "explanation": "Concise, friendly 1-2 sentence explanation focusing on specific skill matches and mutual benefits",
      "complementary_skills": ["React (Advanced) ↔ Python (Beginner)", "Node.js (Expert) ↔ JavaScript (Intermediate)"],
      "mutual_benefit": true
    }
  ]
}

SCORING GUIDE:
- 9-10: Perfect match with multiple complementary skills and mutual benefit
- 7-8.9: Strong match with 1-2 complementary skills
- 5-6.9: Moderate match with some skill overlap
- 3-4.9: Weak match but still potentially valuable
- Below 3: Very weak match, skip

IMPORTANT: Be generous with scoring. If there's ANY potential for skill exchange, include it with at least a 3.0 score. Users are searching for learning opportunities, so cast a wide net.

Return top 10 matches ranked by compatibility_score (highest first). Only include matches with score >= 3.0.`;

    // Call Gemini API with fallback
    let geminiResponse;
    try {
      console.log("Calling Gemini API for matching...");
      console.log("Current user skills to teach:", currentUser.skills_teaching.map(s => s.name).join(", "));
      console.log("Current user wants to learn:", currentUser.skills_learning.map(s => s.name).join(", "));
      geminiResponse = await callGeminiAPI(prompt);
      console.log(`Gemini returned ${geminiResponse.matches?.length || 0} matches`);
      if (geminiResponse.matches?.length === 0) {
        console.log("Gemini found no good matches. Raw response:", JSON.stringify(geminiResponse, null, 2));
      }
    } catch (error) {
      console.error("Gemini API failed, using fallback matching:", error.message);
      // Fallback: Simple skill-based matching
      geminiResponse = {
        matches: candidates.slice(0, 10).map((user, idx) => ({
          user_id: user._id.toString(),
          compatibility_score: 7.0 - (idx * 0.3),
          explanation: `Teaches ${user.skills_teaching[0]?.name || 'various skills'}. Good potential for skill exchange.`,
          complementary_skills: [],
          mutual_benefit: true
        }))
      };
    }

    // If Gemini returned 0 matches but we have candidates, use fallback
    if ((!geminiResponse.matches || geminiResponse.matches.length === 0) && candidates.length > 0) {
      console.log("Gemini returned 0 matches, using intelligent fallback for all candidates");
      geminiResponse.matches = candidates.slice(0, 10).map((user, idx) => ({
        user_id: user._id.toString(),
        compatibility_score: 6.0 - (idx * 0.3),
        explanation: `Teaches ${user.skills_teaching[0]?.name || 'various skills'}. They want to learn ${user.skills_learning[0]?.name || 'new skills'}. Good potential for skill exchange!`,
        complementary_skills: user.skills_teaching.slice(0, 2).map(s => s.name),
        mutual_benefit: true
      }));
    }

    // Validate and enrich response with full user data
    const enrichedMatches = (geminiResponse.matches || [])
      .filter((match) => {
        // Ensure user_id exists in our candidates
        return candidates.some((c) => c._id.toString() === match.user_id);
      })
      .map((match) => {
        const user = candidates.find((c) => c._id.toString() === match.user_id);
        return {
          ...match,
          user: {
            _id: user._id,
            name: user.profile.name,
            avatar_url: user.profile.avatar_url,
            location: user.profile.location,
            bio: user.profile.bio,
            skills_teaching: user.skills_teaching,
            verification_badges: user.verification.badges,
            avg_rating: user.stats.avg_rating,
            total_swaps: user.stats.total_swaps,
          },
        };
      });

    res.json({ matches: enrichedMatches });
  } catch (error) {
    console.error("Match Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get match explanation (detailed view)
exports.getMatchExplanation = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const { target_user_id } = req.params;

    const currentUser = await User.findOne({ auth0_id });
    const targetUser = await User.findById(target_user_id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create detailed explanation prompt
    const prompt = `Provide a detailed skill match analysis between two users.

USER 1 (${currentUser.profile.name}):
- Can teach: ${currentUser.skills_teaching
      .map((s) => `${s.name} (${s.proficiency})`)
      .join(", ")}
- Wants to learn: ${currentUser.skills_learning.map((s) => s.name).join(", ")}

USER 2 (${targetUser.profile.name}):
- Can teach: ${targetUser.skills_teaching
      .map((s) => `${s.name} (${s.proficiency})`)
      .join(", ")}
- Wants to learn: ${targetUser.skills_learning.map((s) => s.name).join(", ")}

Provide detailed analysis in JSON format:
{
  "compatibility_score": 8.5,
  "summary": "One paragraph explaining the match",
  "matching_skills": [
    {"skill": "React", "user1_level": "wants to learn", "user2_level": "Expert"}
  ],
  "complementary_skills": ["Node.js ↔ React"],
  "learning_path": "Suggested sequence of knowledge exchange",
  "estimated_sessions": 4
}`;

    const explanation = await callGeminiAPI(prompt);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
