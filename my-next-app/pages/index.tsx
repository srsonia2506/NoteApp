// pages/index.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;

      axios.get('/api/posts').then((res) => {
        setPosts(res.data);
      });

      axios.get('/api/user').then((res) => {
        setUser(res.data.firstName);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleSubmit = () => {
    axios.post('/api/posts', { category, content }).then(() => {
      axios.get('/api/posts').then((res) => {
        setPosts(res.data);
      });
    });
  };

  return (
    <div className="container mx-auto mt-8">
      {user ? (
        <>
          <div className="mb-4">
            Hi {user}!
            <button className="ml-4 p-2 bg-blue-500 text-white rounded" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="mb-4">
            <label className="mr-2">Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2">
              <option value="">Select Category</option>
              <option value="friends">Friends</option>
              <option value="family">Family</option>
              <option value="relationship">Relationship</option>
              <option value="professional">Professional</option>
              <option value="volunteering">Volunteering</option>
              <option value="outdoor life">Outdoor Life</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="mr-2">Content:</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="p-2 border"
            />
          </div>
          <button className="p-2 bg-blue-500 text-white rounded mr-4" onClick={handleSubmit}>
            Submit
          </button>
          <button className="p-2 bg-green-500 text-white rounded" onClick={() => setCategory('')}>
            View Post-its
          </button>
          <div className="mt-8">
            {Object.entries(posts).map(([email, post]) => (
              <div
                key={email}
                className={`p-4 mb-4 border rounded ${
                  post.category === 'relationship'
                    ? 'bg-red-400'
                    : post.category === 'friends'
                    ? 'bg-blue-400'
                    : post.category === 'family'
                    ? 'bg-gray-400'
                    : post.category === 'outdoor life'
                    ? 'bg-green-400'
                    : post.category === 'volunteering'
                    ? 'bg-orange-400'
                    : 'bg-purple-400'
                }`}
              >
                <p>{post.content}</p>
                <p className="mt-2 text-sm">Category: {post.category}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <p>Please sign in or sign up.</p>
        </div>
      )}
    </div>
  );
};

export default Home;