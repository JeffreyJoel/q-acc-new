import leoProfanity from 'leo-profanity';

// Add additional bad words and racial slurs not covered by default leo-profanity
leoProfanity.add([
  // Additional racial slurs
  'coon', 'chink', 'gook', 'spic', 'wetback', 'kike', 'heeb', 'raghead', 'towelhead',
  'sandnigger', 'paki', 'wog', 'dago', 'guido', 'mick', 'polack', 'kraut', 'zipperhead',
  'curry-muncher', 'jungle bunny', 'porch monkey', 'yard ape', 'spear chucker', 'gringo',

  // Additional profanity
  'cocksucker', 'motherfucker', 'motherfucking', 'faggot', 'fag', 'queer', 'homo', 'sodomite',
  'queerbait', 'fruit', 'retard', 'retarded', 'mongoloid', 'cripple', 'lame', 'braindead',
  'worthless', 'loser', 'failure', 'scum', 'trash', 'dumbass', 'jackass', 'douche', 'twat',
  'wanker', 'prick', 'slut', 'whore', 'cunt', 'pussy', 'dick', 'cock', 'asshole', 'bastard',

  // Leetspeak variations
  'f4ck', 'f4cking', 'sh1t', 'b1tch', 'c0ck', 'c0cksucker', 'nigg3r', 'f4gg0t', 'r3tard',
  'm0th3rfuck3r', 'cunt', 'puss1', 'd1ck', 'c0ck', '4sshole', 'b4stard'
]);

export const checkProfanity = (text: string): boolean => {
  if (!text) return false;
  return leoProfanity.check(text);
};
