import React from 'react'
import { AlertCircle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-body">
                    <div className={`modal-icon ${variant}`}>
                        <AlertCircle size={32} />
                    </div>

                    <h2 className="luxury-text modal-title">{title}</h2>
                    <p className="modal-message">{message}</p>
                </div>

                <div className="modal-actions">
                    <button className="modal-btn-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`modal-btn-confirm ${variant}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
