import React from 'react';

export default function SidebarFilter({ categories, categoryId, setCategoryId }) {
  return (
    <div className="w-full bg-glass border border-glass rounded-2xl p-5 hidden md:block shrink-0 sticky top-24 shadow-xl shadow-black/10">
      <h3 className="font-heading font-black text-slate-200 tracking-wider uppercase text-xs mb-4 pb-3 border-b border-glass flex items-center gap-2">
        <span className="w-1.5 h-3 bg-[var(--color-brand)] rounded-full inline-block"></span>
        Danh mục sản phẩm
      </h3>
      <ul className="space-y-2 text-xs">
        <li>
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-all">
            <input 
              type="radio" 
              name="cat"
              className="accent-[var(--color-brand)] w-4 h-4 cursor-pointer" 
              checked={categoryId === null}
              onChange={() => setCategoryId(null)} 
            />
            <span className={`transition-all ${categoryId === null ? 'font-bold text-[var(--color-brand)] text-glow-orange' : 'text-slate-400 group-hover:text-white font-medium'}`}>
              Tất cả linh kiện
            </span>
          </label>
        </li>
        {categories.map(cat => (
          <li key={cat.id}>
            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-all">
              <input 
                type="radio" 
                name="cat"
                className="accent-[var(--color-brand)] w-4 h-4 cursor-pointer" 
                checked={categoryId === cat.id}
                onChange={() => setCategoryId(cat.id)}
              />
              <span className={`transition-all ${categoryId === cat.id ? 'font-bold text-[var(--color-brand)] text-glow-orange' : 'text-slate-400 group-hover:text-white font-medium'}`}>
                {cat.name}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
