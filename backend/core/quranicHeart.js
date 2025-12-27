export function quranicHeart(intent) {
  const responses = {
    greeting: "قلوبنا مطمئنة بذكر الله وقرآنه.",
    farewell: "دعاءنا لك بالسلامة والرضا من الله.",
    unknown: "اعلم أن الله عليم بحالك ونحن هنا لنفهمك."
  };
  return responses[intent] || responses.unknown;
}
