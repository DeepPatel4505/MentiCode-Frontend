import React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';


function HomePage() {

  const {user,handleLogout} = useAuth()

  useEffect(() => {
    const fetchRepositories = async () => {
      if(user?.githubAccessToken) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/github/repos`);
          const data = await response.json();
          setUser(prev => ({...prev, githubRepos: data.data}));
          console.log("Fetched GitHub repositories:", data.data);
        }
        catch (error) {
          console.error("Failed to fetch GitHub repositories:", error);
        }
      }
    }

    fetchRepositories();
  },[])
  
  return (
    <div>HomePage
      <div>
        Name : {user?.name} <br />
        Email : {user?.email} <br />
        <img src={user?.avatarUrl} alt="Avatar" width="100" height="100" />

        {user?.githubAccessToken && (
          <div>
            Repositories :
            <ul>
              {user.githubRepos?.map(repo => (
                <li key={repo.id}>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  )
}

export default HomePage