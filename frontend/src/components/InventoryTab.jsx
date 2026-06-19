import React, { useState, useEffect } from 'react';
import { AdminAPI } from '../api';
import { formatPrice, parsePrice } from '../utils';
import { Edit2, Trash2, Plus, ArrowLeft, FolderOpen, Package } from 'lucide-react';

export default function InventoryTab({ toast }) {
    // Kategoriyalar state
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null = kategoriyalar ko'rinadi
    const [loadingCats, setLoadingCats] = useState(true);

    // Tovarlar state
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);

    // Tovar modali
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({ name: '', description: '', quantity: 0, unit: 'dona', lowStockThreshold: 10, categoryId: null });
    const [searchQuery, setSearchQuery] = useState('');

    // Kategoriya modali
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [catForm, setCatForm] = useState({ name: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadItems(selectedCategory.id);
        }
    }, [selectedCategory]);

    const loadCategories = () => {
        setLoadingCats(true);
        AdminAPI.getInventoryCategories()
            .then(res => { setCategories(res || []); setLoadingCats(false); })
            .catch(() => { toast("Kategoriyalarni yuklashda xatolik!", "error"); setLoadingCats(false); });
    };

    const loadItems = (categoryId) => {
        setLoadingItems(true);
        AdminAPI.getInventory()
            .then(res => {
                const filtered = (res || []).filter(i => i.categoryId === categoryId);
                setItems(filtered);
                setLoadingItems(false);
            })
            .catch(() => { toast("Tovarlarni yuklashda xatolik!", "error"); setLoadingItems(false); });
    };

    // Kategoriya CRUD
    const openCreateCat = () => { setEditingCat(null); setCatForm({ name: '' }); setShowCatModal(true); };
    const openEditCat = (e, cat) => { e.stopPropagation(); setEditingCat(cat); setCatForm({ name: cat.name }); setShowCatModal(true); };

    const handleSaveCat = (e) => {
        e.preventDefault();
        if (!catForm.name.trim()) return toast("Kategoriya nomini kiriting!", "error");
        const req = editingCat
            ? AdminAPI.updateInventoryCategory(editingCat.id, catForm)
            : AdminAPI.createInventoryCategory(catForm);
        req.then(() => {
            toast(editingCat ? "Saqlandi!" : "Kategoriya qo'shildi!", "success");
            setShowCatModal(false);
            loadCategories();
        }).catch(() => toast("Xatolik yuz berdi!", "error"));
    };

    const handleDeleteCat = (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Kategoriyani o'chirsangiz, unga tegishli tovarlar kategoriyasiz qoladi. Davom etasizmi?")) return;
        AdminAPI.deleteInventoryCategory(id)
            .then(() => { toast("O'chirildi!", "success"); loadCategories(); })
            .catch(() => toast("Xatolik!", "error"));
    };

    // Tovar CRUD
    const openCreateItem = () => {
        setEditingItem(null);
        setItemForm({ name: '', description: '', quantity: 0, unit: 'dona', lowStockThreshold: 10, categoryId: selectedCategory?.id || null });
        setShowItemModal(true);
    };
    const openEditItem = (item) => { setEditingItem(item); setItemForm({ ...item }); setShowItemModal(true); };

    const handleSaveItem = (e) => {
        e.preventDefault();
        if (!itemForm.name || itemForm.quantity < 0) return toast("Ma'lumotlarni to'g'ri kiriting!", "error");
        const req = editingItem
            ? AdminAPI.updateInventoryItem(editingItem.id, itemForm)
            : AdminAPI.createInventoryItem(itemForm);
        req.then(() => {
            toast(editingItem ? "Saqlandi!" : "Qo'shildi!", "success");
            setShowItemModal(false);
            loadItems(selectedCategory.id);
        }).catch(() => toast("Xatolik yuz berdi", "error"));
    };

    const handleDeleteItem = (id) => {
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
        AdminAPI.deleteInventoryItem(id)
            .then(() => { toast("O'chirildi!", "success"); loadItems(selectedCategory.id); })
            .catch(() => toast("Xatolik!", "error"));
    };

    const filteredItems = items.filter(i => (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    // Kategoriya uchun tovarlar sonini hisoblash
    const getCategoryItemCount = (catId) => {
        // Bu faqat UI uchun; keyinroq backenddan olish mumkin
        return null;
    };

    // Kategoriya ranglari
    const catColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

    // ── KATEGORIYALAR KO'RINISHI ────────────────────────────────────────────────
    if (!selectedCategory) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 22, fontWeight: 700 }}>📦 Omborxona</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>Kategoriyani tanlang</p>
                    </div>
                    <button onClick={openCreateCat} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={18} /> Kategoriya qo'shish
                    </button>
                </div>

                {loadingCats ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Yuklanmoqda...</div>
                ) : categories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                        <h3 style={{ color: 'var(--muted)' }}>Hali kategoriya yo'q</h3>
                        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Yuqoridagi tugma orqali yangi kategoriya yarating</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                        {categories.map((cat, idx) => {
                            const color = catColors[idx % catColors.length];
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        background: 'var(--surface)',
                                        border: `2px solid ${color}22`,
                                        borderRadius: 16,
                                        padding: '24px 20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        borderLeft: `5px solid ${color}`
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FolderOpen size={22} style={{ color }} />
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{cat.name}</div>
                                    </div>
                                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                                        <button
                                            onClick={e => openEditCat(e, cat)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, borderRadius: 6 }}
                                            title="Tahrirlash"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={e => handleDeleteCat(e, cat.id)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 6 }}
                                            title="O'chirish"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    <div style={{ color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Package size={13} /> Ko'rish uchun bosing
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Kategoriya Modali */}
                {showCatModal && (
                    <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
                            <div className="modal-header">
                                <h3 style={{ margin: 0 }}>{editingCat ? 'Kategoriyani tahrirlash' : "Yangi kategoriya"}</h3>
                                <button onClick={() => setShowCatModal(false)} className="modal-close">✕</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSaveCat}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Kategoriya nomi *</label>
                                        <input
                                            required
                                            className="form-input"
                                            value={catForm.name}
                                            onChange={e => setCatForm({ name: e.target.value })}
                                            placeholder="Masalan: Dori-darmonlar"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                        {editingCat ? 'Saqlash' : "Qo'shish"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── TOVARLAR KO'RINISHI ────────────────────────────────────────────────────
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => { setSelectedCategory(null); setItems([]); setSearchQuery(''); }}
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontWeight: 600 }}
                    >
                        <ArrowLeft size={16} /> Orqaga
                    </button>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 20, fontWeight: 700 }}>
                            📁 {selectedCategory.name}
                        </h2>
                        <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 13 }}>{items.length} ta tovar</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Qidiruv..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ padding: '9px 14px', width: 200 }}
                    />
                    <button onClick={openCreateItem} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                        <Plus size={18} /> Tovar qo'shish
                    </button>
                </div>
            </div>

            {loadingItems ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Yuklanmoqda...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="med-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                                <th>Nomi</th>

                                <th>Qoldiq</th>
                                <th>O'lchov</th>
                                <th>Chegara</th>
                                <th>Holat</th>
                                <th style={{ width: 100 }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, idx) => {
                                const isLow = item.quantity <= item.lowStockThreshold;
                                return (
                                    <tr key={item.id} style={isLow ? { background: 'rgba(239,68,68,0.05)' } : {}}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><b>{item.name}</b></td>

                                        <td style={{ fontWeight: 700, color: isLow ? '#ef4444' : 'var(--text)' }}>{formatPrice(item.quantity)}</td>
                                        <td>{item.unit}</td>
                                        <td>{formatPrice(item.lowStockThreshold)}</td>
                                        <td>
                                            <span style={{ background: isLow ? '#fecaca' : '#dcfce7', color: isLow ? '#dc2626' : '#16a34a', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                                {isLow ? '⚠ Kamayib qolgan' : '✓ Yetarli'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => openEditItem(item)} className="btn btn-sm btn-ghost" title="Tahrirlash"><Edit2 size={15} /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="btn btn-sm btn-danger" title="O'chirish"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>Bu kategoriyada tovar yo'q</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tovar Modali */}
            {showItemModal && (
                <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>{editingItem ? "Tahrirlash" : "Yangi tovar qo'shish"}</h3>
                            <button onClick={() => setShowItemModal(false)} className="modal-close">✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSaveItem}>
                                <div style={{ marginBottom: 15 }}>
                                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Nomi *</label>
                                    <input required className="form-input" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Masalan: Shprits 5ml" />
                                </div>
                                <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Miqdori *</label>
                                        <input required className="form-input" value={formatPrice(itemForm.quantity)} onChange={e => setItemForm({ ...itemForm, quantity: parsePrice(e.target.value) })} placeholder="0" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>O'lchov birligi *</label>
                                        <input required className="form-input" value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} placeholder="Masalan: dona, ml, kg" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Ogohlantirish chegarasi *</label>
                                    <input required className="form-input" value={formatPrice(itemForm.lowStockThreshold)} onChange={e => setItemForm({ ...itemForm, lowStockThreshold: parsePrice(e.target.value) })} placeholder="0" />
                                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Qoldiq shu raqamga tushganda tizim qizil rangda ogohlantiradi.</p>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15 }}>Saqlash</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
