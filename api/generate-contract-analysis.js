const { OpenAI } = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text: inputData } = req.body;

    if (!inputData || inputData.trim().length === 0) {
        return res.status(400).json({ error: 'Input text is required' });
    }

    try {
        // Demo mode fallback when no API key
        if (!openai) {
            return res.json({
                result: `**CONTRACT ANALYSIS REPORT**\n\n**Document Type:** Employment Agreement\n**Analysis Date:** Current\n**Risk Level:** MEDIUM\n\n---\n\n**📋 KEY TERMS SUMMARY:**\n• Position: Software Engineer\n• Salary: $85,000 annually\n• Start Date: March 1, 2024\n• Employment Type: At-will\n• Benefits: Health, dental, 401k matching\n\n**⚠️ RISK FACTORS IDENTIFIED:**\n\n**HIGH PRIORITY:**\n• **Non-Compete Clause (Section 8.2):** 18-month restriction may be excessive\n• **IP Assignment (Section 12):** Covers work done outside company time\n\n**MEDIUM PRIORITY:**\n• **Termination Notice:** Only 2 weeks required from employer\n• **Confidentiality (Section 15):** Broad definition of proprietary information\n\n**💡 RECOMMENDATIONS:**\n\n**Negotiate These Items:**\n1. Reduce non-compete period to 6-12 months\n2. Clarify IP ownership for personal projects\n3. Request 4-week notice period for terminations\n4. Define confidential information more specifically\n\n**✅ FAVORABLE TERMS:**\n• Reasonable severance package (2 months)\n• Professional development budget included\n• Flexible work arrangement options\n\n**🎯 OVERALL ASSESSMENT:**\nStandard employment agreement with some employer-favorable terms. Most clauses are negotiable and within industry norms. Recommend addressing high-priority items before signing.`,
                demo: true,
                message: "This is a demo response. Add OPENAI_API_KEY environment variable for live AI generation."
            });
        }

        // Real OpenAI API call
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a seasoned contract attorney with expertise in business law, employment agreements, and risk assessment. Analyze contracts for key terms, potential risks, unusual clauses, and provide clear recommendations for non-lawyers.`
                },
                {
                    role: "user", 
                    content: inputData
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const result = completion.choices[0].message.content;

        res.json({
            result: result,
            demo: false
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to demo response on error
        res.json({
            result: `**CONTRACT ANALYSIS REPORT**\n\n**Document Type:** Employment Agreement\n**Analysis Date:** Current\n**Risk Level:** MEDIUM\n\n---\n\n**📋 KEY TERMS SUMMARY:**\n• Position: Software Engineer\n• Salary: $85,000 annually\n• Start Date: March 1, 2024\n• Employment Type: At-will\n• Benefits: Health, dental, 401k matching\n\n**⚠️ RISK FACTORS IDENTIFIED:**\n\n**HIGH PRIORITY:**\n• **Non-Compete Clause (Section 8.2):** 18-month restriction may be excessive\n• **IP Assignment (Section 12):** Covers work done outside company time\n\n**MEDIUM PRIORITY:**\n• **Termination Notice:** Only 2 weeks required from employer\n• **Confidentiality (Section 15):** Broad definition of proprietary information\n\n**💡 RECOMMENDATIONS:**\n\n**Negotiate These Items:**\n1. Reduce non-compete period to 6-12 months\n2. Clarify IP ownership for personal projects\n3. Request 4-week notice period for terminations\n4. Define confidential information more specifically\n\n**✅ FAVORABLE TERMS:**\n• Reasonable severance package (2 months)\n• Professional development budget included\n• Flexible work arrangement options\n\n**🎯 OVERALL ASSESSMENT:**\nStandard employment agreement with some employer-favorable terms. Most clauses are negotiable and within industry norms. Recommend addressing high-priority items before signing.`,
            demo: true,
            message: "Temporary issue with AI service. Showing demo response.",
            error: error.message
        });
    }
}