import { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Star, Bookmark } from 'lucide-react';
import { Link } from "react-router-dom";

const SavedListsContent = ({ userData }) => {
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedLists = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${userData._id}/saved-lists`
        );
        setSavedLists(response.data);
      } catch (error) {
        console.error('Error fetching saved lists:', error);
        setError('Failed to load saved lists');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedLists();
  }, [userData._id]);
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#9ab] mb-6">SAVED LISTS</h2>
      
      {/* Same grid layout as ListsContent */}
    </div>
  );
};

export default SavedListsContent;