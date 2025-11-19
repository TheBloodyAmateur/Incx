import React, { useState } from 'react';

export default function UploadModal({ bucketName, currentPath, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');

    // TODO: Implement file upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !fileName) return;

        console.log(`Uploading file: ${fileName} to ${bucketName}/${currentPath.join('/')}`);
        onUploadSuccess();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload File</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        File:
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                    </label>
                    <label>
                        File Name:
                        <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
                    </label>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
