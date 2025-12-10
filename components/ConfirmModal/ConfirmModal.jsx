'use client';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={`${styles.icon} ${styles[type]}`}>
            {type === 'danger' && '⚠'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </div>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`${styles.confirmBtn} ${styles[type]}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
