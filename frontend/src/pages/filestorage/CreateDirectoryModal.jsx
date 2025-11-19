import React, { useState } from 'react';

export default function CreateDirectoryModal({ bucketName, currentPath, onClose, onDirectoryCreated }) {
    const [directoryName, setDirectoryName] = useState('');

    // TODO: Implement directory creation
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!directoryName) return;

        console.log(`Creating directory: ${directoryName} in ${bucketName}/${currentPath.join('/')}`);
        onDirectoryCreated();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create Directory</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Directory Name:
                        <input type="text" value={directoryName} onChange={(e) => setDirectoryName(e.target.value)} required />
                    </label>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
