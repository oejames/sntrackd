import React, { useState } from 'react';
import { Search, X, GripVertical } from 'lucide-react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CreateListModal = ({ onClose, onListCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSketches, setSelectedSketches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSketch, setActiveSketch] = useState(null);
  const [sketchNotes, setSketchNotes] = useState({});

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

    setSelectedSketches(prev => {
      // If ranked, add to the end with position
      const position = isRanked ? prev.length + 1 : null;
      return [...prev, { 
        sketch: activeSketch,
        notes: sketchNotes[activeSketch._id] || '',
        position
      }];
    });

    setActiveSketch(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveSketch = (sketchId) => {
    setSelectedSketches(prev => {
      const filtered = prev.filter(item => item.sketch._id !== sketchId);
      // If ranked, reorder positions
      if (isRanked) {
        return filtered.map((item, index) => ({
          ...item,
          position: index + 1
        }));
      }
      return filtered;
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const newSketches = Array.from(selectedSketches);
    const [reorderedSketch] = newSketches.splice(result.source.index, 1);
    newSketches.splice(result.destination.index, 0, reorderedSketch);
  
    // Update positions if ranked
    if (isRanked) {
      const updatedSketches = newSketches.map((sketch, index) => ({
        ...sketch,
        position: index + 1
      }));
      setSelectedSketches(updatedSketches);
    } else {
      setSelectedSketches(newSketches);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lists`,
        {
          title,
          description,
          isRanked,
          entries: selectedSketches.map(({ sketch, notes, position }) => ({
            sketchId: sketch._id,
            notes,
            position
          }))
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      onListCreated(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2c3440] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New List</h2>
          <button onClick={onClose} className="text-[#9ab] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* List Details */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="List name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030]"
            />
            
            <textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] text-white rounded border border-[#456] focus:outline-none focus:border-[#00c030] min-h-[100px]"
            />

            <label className="flex items-center gap-2 text-[#9ab]">
              <input
                type="checkbox"
                checked={isRanked}
                onChange={(e) => setIsRanked(e.target.checked)}
                className="form-checkbox text-[#00c030]"
              />
              Ranked list
            </label>
          </div>

          {/* Search and Add Sketches */}
          <div>
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

            {/* Active Sketch Notes */}
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
                  value={sketchNotes[activeSketch._id] || ''}
                  onChange={(e) => setSketchNotes(prev => ({
                    ...prev,
                    [activeSketch._id]: e.target.value
                  }))}
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
          </div>

 {/* Selected Sketches */}
{selectedSketches.length > 0 && (
  <div>
    <h3 className="text-[#9ab] text-sm font-semibold mb-2">
      {isRanked ? 'Ranked Sketches' : 'Added Sketches'} ({selectedSketches.length})
    </h3>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list-sketches">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {selectedSketches.map((item, index) => (
              <Draggable
                key={item.sketch._id}
                draggableId={item.sketch._id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center justify-between p-2 bg-[#14181c] rounded"
                  >
                    <div className="flex items-center gap-4">
                      <div {...provided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="text-[#9ab]" size={20} />
                      </div>
                      {isRanked && (
                        <span className="text-[#9ab] w-6 text-center">
                          {index + 1}
                        </span>
                      )}
                      <img
                        src={item.sketch.thumbnails?.[0]?.url}
                        alt={item.sketch.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                      <div>
                        <span className="text-white block">
                          {item.sketch.title}
                        </span>
                        {item.notes && (
                          <span className="text-sm text-[#9ab]">
                            Has notes
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSketch(item.sketch._id)}
                      className="text-[#9ab] hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
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

          {/* Save Button */}
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
              disabled={loading || !title.trim() || selectedSketches.length === 0}
            >
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;