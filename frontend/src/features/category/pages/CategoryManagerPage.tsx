import React, { useEffect, useState } from 'react';
import categoryApi, { Category, CategoryRequest } from '../../../api/categoryApi';

const PRESET_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

const CategoryManagerPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSource, setMergeSource] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryRequest>({ name: '', description: '', colorHex: '#6366f1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAllCategories();
      setCategories(res.data.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditTarget(null); setForm({ name: '', description: '', colorHex: '#6366f1' }); setShowForm(true); setError(''); };
  const openEdit = (c: Category) => { setEditTarget(c); setForm({ name: c.name, description: c.description, colorHex: c.colorHex }); setShowForm(true); setError(''); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (editTarget) await categoryApi.updateCategory(editTarget.id, form);
      else await categoryApi.createCategory(form);
      setShowForm(false); fetch();
    } catch { setError('Failed to save category.'); } finally { setSaving(false); }
  };

  const handleToggle = async (c: Category) => { await categoryApi.toggleActive(c.id); fetch(); };

  const handleDelete = async (c: Category) => {
    if (c.videoCount > 0) { alert(`Cannot delete "${c.name}" — it has ${c.videoCount} videos. Merge it first.`); return; }
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    await categoryApi.deleteCategory(c.id); fetch();
  };

  const handleMerge = async (targetId: number) => {
    if (!mergeSource || mergeSource === targetId) return;
    const src = categories.find(c => c.id === mergeSource)?.name;
    const tgt = categories.find(c => c.id === targetId)?.name;
    if (!window.confirm(`Merge "${src}" into "${tgt}"? All videos in "${src}" will move to "${tgt}" and "${src}" will be deleted.`)) return;
    await categoryApi.mergeCategories({ sourceCategoryId: mergeSource, targetCategoryId: targetId });
    setMergeMode(false); setMergeSource(null); fetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Category Manager</h1>
          <p className="text-gray-400 mt-1">Create, rename and merge video categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMergeMode(!mergeMode); setMergeSource(null); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${mergeMode ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'}`}>
            {mergeMode ? '✕ Cancel Merge' : '⇄ Merge Mode'}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-900/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            New Category
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: categories.length, color: 'from-violet-600/20 to-purple-600/20', border: 'border-violet-500/30' },
          { label: 'Active', value: categories.filter(c => c.isActive).length, color: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30' },
          { label: 'Inactive', value: categories.filter(c => !c.isActive).length, color: 'from-gray-600/20 to-slate-600/20', border: 'border-gray-500/30' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4`}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {mergeMode && (
        <div className="mb-6 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-300 text-sm">
          {mergeSource
            ? `Selected: "${categories.find(c => c.id === mergeSource)?.name}" → Now click the target category to merge into`
            : '📌 Click a category to select it as the SOURCE of the merge'}
        </div>
      )}

      {/* Category Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map(cat => (
            <div key={cat.id}
              onClick={mergeMode ? () => mergeSource ? handleMerge(cat.id) : setMergeSource(cat.id) : undefined}
              className={`group relative bg-white/5 border rounded-xl p-5 transition-all ${
                mergeMode ? 'cursor-pointer hover:border-orange-500/60' :
                !cat.isActive ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              } ${mergeSource === cat.id ? 'border-orange-500 bg-orange-500/10' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.colorHex }}/>
                  <div>
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {cat.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{cat.videoCount} video{cat.videoCount !== 1 ? 's' : ''}</span>
                {!mergeMode && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(cat)} className="hover:text-violet-400 transition-colors">Edit</button>
                    <button onClick={() => handleToggle(cat)} className="hover:text-yellow-400 transition-colors">{cat.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => handleDelete(cat)} className="hover:text-red-400 transition-colors">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editTarget ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="e.g. Technology"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Short description of this category..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({...f, colorHex: c}))}
                      className={`w-7 h-7 rounded-full transition-all ${form.colorHex === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}/>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-sm">
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagerPage;
