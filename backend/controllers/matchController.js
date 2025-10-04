const User = require("../models/User");
const axios = require("axios");

// Gemini API Integration
const callGeminiAPI = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error("Failed to get AI matching results");
  }
};

// Find skill matches
exports.findMatches = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
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

    if (candidates.length === 0) {
      return res.json({ matches: [] });
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
    const prompt = `You are a skill-matching AI assistant for a skill exchange platform.

CURRENT USER PROFILE:
- Name: ${currentUser.profile.name}
- Skills they can teach: ${
      currentUser.skills_teaching
        .map((s) => `${s.name} (${s.proficiency})`)
        .join(", ") || "None listed"
    }
- Skills they want to learn: ${
      currentUser.skills_learning.map((s) => s.name).join(", ") || "None listed"
    }
- Search query: "${skill_query || "General matching"}"

POTENTIAL MATCHES:
${candidatesData
  .map(
    (user, idx) => `
${idx + 1}. User: ${user.name}
   - Can teach: ${user.skills_teaching}
   - Wants to learn: ${user.skills_learning}
   - Verified: ${user.verification}
   - Rating: ${user.avg_rating}/5
`
  )
  .join("\n")}

TASK:
Analyze compatibility and rank these users. Consider:
1. Complementary skills (what they teach vs what current user wants to learn)
2. Mutual exchange potential (both can teach each other)
3. Proficiency levels (ensure teacher is advanced enough)
4. Verification status and ratings

Return ONLY valid JSON (no markdown formatting) in this exact format:
{
  "matches": [
    {
      "user_id": "exact_user_id_from_list",
      "compatibility_score": 8.5,
      "explanation": "Brief natural explanation why they match",
      "complementary_skills": ["Skill1 ↔ Skill2"],
      "mutual_benefit": true
    }
  ]
}

Rank by compatibility_score (0-10). Return top 10 matches only.`;

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt);

    // Validate and enrich response with full user data
    const enrichedMatches = geminiResponse.matches
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
    const { sub: auth0_id } = req.auth;
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
