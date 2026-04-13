import React from 'react';

export default function SidebarFilter({ categories, categoryId, setCategoryId }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-5 hidden md:block shrink-0 sticky top-24">
      <h3 className="font-bold text-slate-800 tracking-wide uppercase text-sm mb-4 pb-2 border-b border-slate-100">Danh mục sản phẩm</h3>
      <ul className="space-y-3 text-sm">
        <li>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="cat"
              className="accent-[var(--color-brand)] w-4 h-4 cursor-pointer" 
              checked={categoryId === null}
              onChange={() => setCategoryId(null)} 
            />
            <span className={`group-hover:text-[var(--color-brand)] transition-colors ${categoryId === null ? 'font-bold text-[var(--color-brand)]' : 'text-slate-600 font-medium'}`}>
              Tất cả linh kiện
            </span>
          </label>
        </li>
        {categories.map(cat => (
          <li key={cat.id}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="cat"
                className="accent-[var(--color-brand)] w-4 h-4 cursor-pointer" 
                checked={categoryId === cat.id}
                onChange={() => setCategoryId(cat.id)}
              />
              <span className={`group-hover:text-[var(--color-brand)] transition-colors ${categoryId === cat.id ? 'font-bold text-[var(--color-brand)]' : 'text-slate-600 font-medium'}`}>
                {cat.name}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
