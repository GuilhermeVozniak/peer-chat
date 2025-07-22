// Server-side utility functions

export function generateUserId(): string {
  return `user_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`;
}
