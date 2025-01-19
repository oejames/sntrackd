import React, { useState } from 'react';
import { Search, X, GripVertical } from 'lucide-react';
import axios from 'axios';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const EditListModal = ({ list, onClose, onListUpdated }) => {
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || '');
  const [isRanked, setIsRanked] = useState(list.isRanked);
  const [entries, setEntries] = useState(list.entries);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeSketch, setActiveSketch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPublic, setIsPublic] = useState(list.isPublic);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sketches`,
        { params: { search: query } }
      );
      setSearchResults(response.data.sketches);
    } catch (error) {
      console.error('Error searching sketches:', error);
    }
  };

  const handleSketchSelect = (sketch) => {
    setActiveSketch(sketch);
  };

  const handleAddSketch = () => {
    if (!activeSketch) return;

    setEntries(prev => {
      // Check if sketch is already in list
      if (prev.some(entry => entry.sketchId._id === activeSketch._id)) {
        return prev;
      }

      const position = isRanked ? prev.length + 1 : null;
      return [...prev, {
        sketchId: activeSketch,
        notes: '',
        position
      }];
    });

    setActiveSketch(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveSketch = (sketchId) => {
    setEntries(prev => {
      const filtered = prev.filter(entry => entry.sketchId._id !== sketchId);
      if (isRanked) {
        return filtered.map((entry, index) => ({
          ...entry,
          position: index + 1
        }));
      }
      return filtered;
    });
  };

  const handleNotesChange = (sketchId, notes) => {
    setEntries(prev => prev.map(entry => 
      entry.sketchId._id === sketchId ? { ...entry, notes } : entry
    ));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newEntries = Array.from(entries);
    const [reorderedEntry] = newEntries.splice(result.source.index, 1);
    newEntries.splice(result.destination.index, 0, reorderedEntry);

    // Update positions if ranked
    if (isRanked) {
      const updated = newEntries.map((entry, index) => ({
        ...entry,
        position: index + 1
      }));
      setEntries(updated);
    } else {
      setEntries(newEntries);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/lists/${list._id}`,
        {
          title,
          description,
          isRanked,
          isPublic,
          entries: entries.map(({ sketchId, notes, position }) => ({
            sketchId: sketchId._id,
            notes,
            position
          }))
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      onListUpdated(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2c3440] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit List</h2>
          <button onClick={onClose} className="text-[#9ab] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030]"
              placeholder="List title"
            />
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030] min-h-[100px]"
              placeholder="Add a description..."
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[#9ab]">
                <input
                  type="checkbox"
                  checked={isRanked}
                  onChange={(e) => setIsRanked(e.target.checked)}
                  className="form-checkbox text-[#00c030]"
                />
                Ranked list
              </label>

              {/* <label className="flex items-center gap-2 text-[#9ab]">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="form-checkbox text-[#00c030]"
                />
                Public list
              </label> */}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search sketches to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full px-4 py-2 pl-10 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab]" size={16} />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map(sketch => (
                <div
                  key={sketch._id}
                  onClick={() => handleSketchSelect(sketch)}
                  className={`flex items-center gap-4 p-2 rounded cursor-pointer ${
                    activeSketch?._id === sketch._id
                      ? 'bg-[#00c030]/20 border border-[#00c030]'
                      : 'hover:bg-[#384250]'
                  }`}
                >
                  <img
                    src={sketch.thumbnails?.[0]?.url}
                    alt={sketch.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <span className="text-white">{sketch.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Active Sketch */}
          {activeSketch && (
            <div className="mt-4 p-4 bg-[#14181c] rounded">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeSketch.thumbnails?.[0]?.url}
                    alt={activeSketch.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <span className="text-white">{activeSketch.title}</span>
                </div>
              </div>
              <textarea
                placeholder="Add notes (optional)..."
                className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030] min-h-[80px]"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddSketch}
                  className="px-4 py-2 bg-[#00c030] text-white rounded hover:bg-[#00e054]"
                >
                  Add to List
                </button>
              </div>
            </div>
          )}

          {/* Entries List */}
          {entries.length > 0 && (
            <div>
              <h3 className="text-[#9ab] text-sm font-semibold mb-2">
                {isRanked ? 'Ranked Sketches' : 'Added Sketches'} ({entries.length})
              </h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="list-entries">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {entries.map((entry, index) => (
                          <Draggable
                          key={entry.sketchId._id}
                          draggableId={entry.sketchId._id.toString()} // Convert ObjectId to string
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-[#14181c] rounded p-4"
                            >
                              <div className="flex items-start gap-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="text-[#9ab]" size={20} />
                                </div>
                                <div className="flex-grow">
                                  <div className="flex items-center gap-4 mb-2">
                                    {isRanked && (
                                      <span className="text-[#9ab] font-medium">
                                        #{index + 1}
                                      </span>
                                    )}
                                    <img
                                      src={entry.sketchId.thumbnails?.[0]?.url}
                                      alt={entry.sketchId.title}
                                      className="w-16 h-10 object-cover rounded"
                                    />
                                    <span className="text-white">
                                      {entry.sketchId.title}
                                    </span>
                                  </div>
                                  <textarea
                                    value={entry.notes || ''}
                                    onChange={(e) => handleNotesChange(entry.sketchId._id, e.target.value)}
                                    placeholder="Add notes..."
                                    className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030] min-h-[60px]"
                                  />
                                </div>
                                <button
                                  onClick={() => handleRemoveSketch(entry.sketchId._id)}
                                  className="text-[#9ab] hover:text-red-500"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {error && (
            <div className="text-red-500 bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#9ab] hover:text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#00c030] text-white rounded hover:bg-[#00e054] disabled:opacity-50"
              disabled={loading || !title.trim() || entries.length === 0}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListModal;