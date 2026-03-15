import styles from './TemplateSelector.module.css';

export default function TemplateSelector({ templates, onUse, onEdit, onDelete }) {
  if (!templates?.length) return null;
  return (
    <div className={styles.grid}>
      {templates.map((t) => (
        <div key={t._id} className={styles.card}>
          <span className={styles.tone}>{t.tone || 'General'}</span>
          <h4 className={styles.name}>{t.name}</h4>
          <p className={styles.subject}>{t.subject}</p>
          <div className={styles.actions}>
            <button type="button" onClick={() => onUse(t)} className={styles.useBtn}>
              Use
            </button>
            {onEdit && (
              <button type="button" onClick={() => onEdit(t)} className={styles.secBtn}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={() => onDelete(t)} className={styles.delBtn}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
