export async function signUpWithEmail(
  email,
  password,
  fullName,
  username
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username || email.split('@')[0],
          avatar_url: null
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}