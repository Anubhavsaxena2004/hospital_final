import React, { useState, useEffect } from 'react';
import './Beds.css';
import { bedAPI } from '../../services/api';

// Define types for our data
interface Bed {
  id: number;
  bed_number: string;
  bed_type: 'general' | 'icu' | 'emergency' | 'pediatric' | 'private';
  is_occupied: boolean;
  notes?: string;
}

interface BedStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
}

const Beds: React.FC = () => {
  // State for bed data and filters
  const [beds, setBeds] = useState<Bed[]>([]);
  const [filteredBeds, setFilteredBeds] = useState<Bed[]>([]);
  const [selectedBedType, setSelectedBedType] = useState<'All' | 'general' | 'icu' | 'emergency' | 'pediatric' | 'private'>('All');
  const [stats, setStats] = useState<Record<string, { total: number; available: number; occupied: number }>>({});
  const [error, setError] = useState<string | null>(null);

  // Load from API
  useEffect(() => {
    const loadBeds = async () => {
      try {
        const data = await bedAPI.getBeds();
        const list: Bed[] = Array.isArray(data) ? data : data?.results || [];
        setBeds(list);
        setFilteredBeds(list);
      } catch (err: any) {
        setError('Failed to load beds');
        console.error('Error loading beds:', err);
      }
      try {
        const statsRes = await bedAPI.getBedStats();
        setStats(statsRes?.beds || {});
      } catch (err) {
        console.error('Error loading bed stats:', err);
      }
    };
    loadBeds();
  }, []);

  // Calculate statistics
  // Recompute stats from API data if needed in future

  // Filter beds by type
  const filterBedsByType = (type: 'All' | 'general' | 'icu' | 'emergency' | 'pediatric' | 'private') => {
    setSelectedBedType(type);
    if (type === 'All') setFilteredBeds(beds);
    else setFilteredBeds(beds.filter(bed => bed.bed_type === type));
  };

  // Add a new bed
  const addBed = async (type: 'general' | 'icu' | 'emergency' | 'pediatric' | 'private') => {
    try {
      const payload = { bed_number: `B-${Date.now()}`, bed_type: type, is_occupied: false, notes: '' };
      const created = await bedAPI.createBed(payload);
      const updated = [created, ...beds];
      setBeds(updated);
      setFilteredBeds(selectedBedType === 'All' ? updated : updated.filter(bed => bed.bed_type === selectedBedType));
    } catch (error: any) {
      console.error('Error creating bed:', error);
      alert(`Failed to create bed: ${error.message || error}`);
    }
  };

  // Remove a bed
  const removeBed = async (id: number) => {
    await bedAPI.deleteBed(id);
    const updatedBeds = beds.filter(bed => bed.id !== id);
    setBeds(updatedBeds);
    setFilteredBeds(selectedBedType === 'All' ? updatedBeds : updatedBeds.filter(bed => bed.bed_type === selectedBedType));
  };

  // Toggle bed status
  const toggleBedStatus = async (id: number) => {
    const bed = beds.find(b => b.id === id);
    if (!bed) return;
    const updated = await bedAPI.updateBed(id, { is_occupied: !bed.is_occupied });
    const list = beds.map(b => (b.id === id ? updated : b));
    setBeds(list);
    setFilteredBeds(selectedBedType === 'All' ? list : list.filter(b => b.bed_type === selectedBedType));
  };

  return (
    <div className="beds-container">
      <h1>Hospital Bed Management</h1>
      
      {/* Statistics Cards */}
      {error && <div className="error" style={{marginBottom: '12px'}}>{error}</div>}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Beds</h3>
          <div className="stat-number">{stats.total?.total || 0}</div>
          <div className="stat-detail">{stats.total?.available || 0} available</div>
        </div>

        {/* Removed hardcoded stats to keep UI data-driven */}
      </div>
      
      {/* Bed Type Filter */}
      <div className="bed-type-filter">
        {['All','general','icu','emergency','pediatric','private'].map(t => (
          <button
            key={t}
            className={selectedBedType === t ? 'active' : ''}
            onClick={() => filterBedsByType(t as any)}
          >
            {t.toString().toUpperCase()} {t !== 'All' && `(${stats[t]?.total || 0})`}
          </button>
        ))}
      </div>
      
      {/* Bed Management Actions */}
      <div className="bed-actions">
        <h2>Manage Beds</h2>
        <div className="action-buttons">
          <div className="action-group">
            <span>Add Bed:</span>
            {(['general','icu','emergency','pediatric','private'] as const).map(t => (
              <button key={t} onClick={() => addBed(t)}>+ {t.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Beds List */}
      <div className="beds-list">
        <h2>{selectedBedType} Beds</h2>
        <div className="beds-grid">
          {filteredBeds.map(bed => (
            <div key={bed.id} className={`bed-card ${bed.is_occupied ? 'occupied' : 'available'}`}>
              <div className="bed-header">
                <span className="bed-id">{bed.bed_number}</span>
                <span className="bed-type">{bed.bed_type.toUpperCase()}</span>
              </div>
              <div className="bed-status">{bed.is_occupied ? 'Occupied' : 'Available'}</div>
              <div className="bed-info">
                {bed.notes && <div className="bed-notes">{bed.notes}</div>}
              </div>
              <div className="bed-actions">
                <button 
                  className="status-toggle"
                  onClick={() => toggleBedStatus(bed.id)}
                >
                  {bed.is_occupied ? 'Mark Available' : 'Mark Occupied'}
                </button>
                <button 
                  className="remove-bed"
                  onClick={() => removeBed(bed.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Beds;