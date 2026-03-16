/**
 * Generates a consistent gradient color pair based on a string
 * Always returns the same gradients for the same input
 */
export function getGradientColors(name: string): { from: string; to: string } {
  const gradients = [
    { from: "from-blue-400", to: "to-blue-600" },
    { from: "from-purple-400", to: "to-purple-600" },
    { from: "from-red-400", to: "to-red-600" },
    { from: "from-green-400", to: "to-green-600" },
    { from: "from-yellow-400", to: "to-yellow-600" },
    { from: "from-pink-400", to: "to-pink-600" },
    { from: "from-indigo-400", to: "to-indigo-600" },
    { from: "from-cyan-400", to: "to-cyan-600" },
    { from: "from-emerald-400", to: "to-emerald-600" },
    { from: "from-orange-400", to: "to-orange-600" },
  ];

  // Generate a consistent hash based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

/**
 * Gets the first letter of a name in uppercase
 */
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
