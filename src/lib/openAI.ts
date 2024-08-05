import OpenAI from "openai";
const { OPENAI_ORG_ID, OPENAI_PROJ_ID } = process.env;

// Crie uma nova instância do OpenAI
export const openai = new OpenAI({
  organization: OPENAI_ORG_ID,
  project: OPENAI_PROJ_ID,
});
