import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TemplateSelector from '../components/TemplateSelector';
import { templates as templatesApi } from '../services/api';
import styles from './Templates.module.css';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const load = () => {
    setLoading(true);
    templatesApi
      .list()
      .then(({ data }) => setTemplates(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const navigate = useNavigate();
  const handleUse = (t) => {
    navigate('/compose', { state: { template: { subject: t.subject, body: t.body, name: t.name } } });
  };

  const handleEdit = (t) => {
    setEditing(t._id);
    setEditName(t.name);
    setEditSubject(t.subject);
    setEditBody(t.body);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await templatesApi.update(editing, { name: editName, subject: editSubject, body: editBody });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await templatesApi.delete(t._id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className={styles.page}><p>Loading templates…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;

  return (
    <div className={styles.page}>
      <h1>Templates</h1>
      {editing && (
        <div className={styles.modal}>
          <h3>Edit template</h3>
          <label>Name <input value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.input} /></label>
          <label>Subject <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className={styles.input} /></label>
          <label>Body <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={6} className={styles.textarea} /></label>
          <div className={styles.modalActions}>
            <button type="button" onClick={handleSaveEdit} className={styles.primaryBtn}>Save</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
      <TemplateSelector
        templates={templates}
        onUse={handleUse}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Link to="/compose" className={styles.newCard}>
        <span className={styles.plus}>+</span>
        New Template
      </Link>
    </div>
  );
}
