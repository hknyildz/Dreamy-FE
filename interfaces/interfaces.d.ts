

interface profile {
  username: string,
  bio: string,
  is_private: boolean,
  avatar_url: string
}

type Dream = {
  id: string;
  title: string;
  content: string;
  is_private: boolean;
  dream_date: string;
  user_id: string;
  created_at: string;
}

