import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = async (path) => readFile(new URL(path, root), "utf8");

const canonical =
  "NordSym builds and operates AI agents inside your tech stack to take over recurring work that costs your company time and money.";

const homepage = await read("index.html");
const llms = await read("llms.txt");
const agentsMarkdown = await read("agents.md");
const agentsJson = JSON.parse(await read("agents.json"));
const agentInfo = JSON.parse(await read("agent-info.json"));
const apiAgentInfo = await read("api/agent-info.js");
const systemsCanon = JSON.parse(await read("systems.canon.json"));
const paidLanding = await read("ai-i-drift/index.html");
const paidBridge = await read("ai-i-drift/sa-fungerar-det/index.html");
const staticCopy = await read("output/meta-static-creatives-2026-07-28/copy.md");
const launchPacket = await read("output/meta-launch-ready-packet-2026-08-01.md");
const activeLaunchPacket = launchPacket.split("## Asset decision")[0];

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(homepage.includes(canonical), "Homepage is missing the canonical commercial promise.");
assert(llms.includes("builds and operates AI agents inside"), "llms.txt is missing the AI-agent position.");
assert(agentsMarkdown.includes("builds and operates AI agents inside"), "agents.md is missing the AI-agent position.");
assert(agentsJson.primary_promise === "AI agents that take recurring work off the team.", "agents.json primary promise has drifted.");
assert(agentInfo.description?.includes("builds and operates AI agents inside"), "agent-info.json description has drifted.");
assert(apiAgentInfo.includes("builds and operates AI agents inside"), "api/agent-info.js description has drifted.");
assert(paidLanding.includes("Vilket återkommande arbete vill ni få bort från teamet?"), "Paid qualification framing has drifted.");
assert(paidBridge.includes("Se hur en AI-agent kan ta återkommande arbete från teamet."), "Paid bridge headline has drifted.");
assert(paidBridge.includes("Hitta arbetet en agent kan ta över"), "Paid bridge CTA has drifted.");
assert(staticCopy.includes("Vad ska en AI-agent ta över?"), "Lead static headline has drifted.");
assert(launchPacket.includes("AI agents inside the client's tech stack"), "Meta launch packet has drifted from the site position.");
assert(!activeLaunchPacket.includes("Demo är inte drift"), "Current Meta launch packet still leads with the retired demo thesis.");
assert(!homepage.includes("Find the first operation"), "Homepage still exposes internal operation jargon in its CTA.");
assert(!homepage.includes(">First operation<"), "Homepage still exposes the retired First operation offer label.");
assert(!homepage.includes(">Managed operations<"), "Homepage still exposes the retired Managed operations offer label.");
assert(!homepage.includes(">Operating expansion<"), "Homepage still exposes the retired Operating expansion offer label.");

assert(!/\b41\b[\s\S]{0,120}(operations|agent operations|recurring operations)/i.test(homepage), "Homepage still presents the unverified 41-operation claim.");
assert(!/\b41\b[\s\S]{0,120}(operations|agent operations|recurring operations)/i.test(llms), "llms.txt still presents the unverified 41-operation claim.");

const faqScript = [...homepage.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .map((raw) => {
    try { return JSON.parse(raw); } catch { return null; }
  })
  .find((entry) => entry?.["@type"] === "FAQPage");

const faqSection = homepage.match(/<section id="faq"[\s\S]*?<section id="contact"/)?.[0] ?? "";
const visibleFaq = [...faqSection.matchAll(/<button class="scp4"[^>]*><span>(.*?)<\/span><span>[\s\S]*?<\/button><p hidden[^>]*>(.*?)<\/p>/gi)]
  .map(([, question, answer]) => ({
    question: question.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    answer: answer.replace(/<[^>]+>/g, "").replace(/&rsquo;/g, "’").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
  }));
const schemaFaq = faqScript?.mainEntity?.map((item) => ({
  question: item.name,
  answer: item.acceptedAnswer?.text
})) ?? [];
assert(visibleFaq.length > 0, "No visible homepage FAQ entries found.");
assert(JSON.stringify(visibleFaq) === JSON.stringify(schemaFaq), "Visible homepage FAQ and FAQPage JSON-LD do not match exactly.");

const systems = systemsCanon.visible_systems ?? systemsCanon.systems ?? systemsCanon;
const agentBadge = Array.isArray(systems)
  ? systems.find((system) => /agent badge/i.test(system.name ?? system.title ?? ""))
  : null;
assert(agentBadge, "Agent Badge is missing from systems canon.");
if (agentBadge) {
  const serialized = JSON.stringify(agentBadge);
  assert(!/https?:\/\//i.test(serialized), "Agent Badge must remain bounded without a public URL.");
}

if (failures.length) {
  console.error("Positioning parity failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Positioning parity OK: ${visibleFaq.length} FAQ entries, canonical promise aligned, Agent Badge bounded.`);
