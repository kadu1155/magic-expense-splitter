const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function parseExpenseWithAI(text, users) {
  const userList = users.map(u => u.name).join(', ');
  const prompt = `
    Extract expense details from this text: "${text}"
    Available people: ${userList}
    
    Return a JSON object with:
    {
      "amount": number,
      "description": string,
      "payerName": string,
      "category": string,
      "participants": [
        { "name": string, "share": number }
      ],
      "splitType": "equal" | "exact"
    }

    Rule: If participants are not specified, assume all people share equally.
    Rule: Match payerName and participant names exactly with the available people.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const jsonText = response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(jsonText);
}

async function generateMagicInsights(users, expenses, balances) {
  const dataSummary = {
    users: users.map(u => u.name),
    totalExpenses: expenses.length,
    recentExpenses: expenses.slice(0, 10).map(e => ({
      desc: e.description,
      amt: e.amount,
      payer: e.Payer?.name,
      category: e.category,
      pending: e.isPending
    })),
    balances: balances.transactions
  };

  const prompt = `
    You are a "Smart Financial Magic Consultant" for a group of friends using an Expense Splitter app.
    Based on this group data: ${JSON.stringify(dataSummary)}
    
    Provide "Magical" insights in JSON format:
    {
      "summary": "A witty 1-sentence summary of the group's spending mood (e.g., 'The group is in a gourmet food phase!')",
      "praise": "Something positive about someone (e.g., 'Rahul is the group's financial anchor this week')",
      "nudge": "A gentle, funny nudge for someone who owes (e.g., 'Time for Neha to treat the group to coffee to balance the scales')",
      "harmonyScore": number (0-100, where 100 is perfectly settled),
      "nextPayerSuggestion": "Name of the person who should pay the next small expense to help balance things"
    }
    
    Tone: Fun, helpful, slightly magical, and encouraging.
    Return ONLY valid JSON.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const jsonText = response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(jsonText);
}

module.exports = { parseExpenseWithAI, generateMagicInsights };
