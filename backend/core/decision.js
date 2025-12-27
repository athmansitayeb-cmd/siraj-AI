export function decide(intent, state) {
  switch (intent) {
    case "greeting":
      return "reply_greeting";
    case "farewell":
      return "reply_farewell";
    default:
      return "reply_unknown";
  }
}
