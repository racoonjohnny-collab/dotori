import { useState, useCallback } from 'react';
import { useApp } from '../../store/AppContext';
import { ALL_RECIPES, MATERIALS, RARITY_COLORS, RECIPE_CATEGORIES, canCraft, deductMaterials } from '../../data/recipes';

export default function CraftTab() {
  const { state, dispatch, showToast } = useApp();
  const resources = state.myGarden.resources || {};
  const [category, setCategory] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const filtered = category === 'all'
    ? ALL_RECIPES
    : ALL_RECIPES.filter(r => r.category === category);

  const craft = useCallback((recipe) => {
    if (!canCraft(recipe, resources)) {
      showToast('재료가 부족해요!');
      return;
    }

    const newResources = deductMaterials(recipe, resources);
    dispatch({ type: 'SET_MY_GARDEN', garden: { resources: newResources } });
    dispatch({ type: 'ADD_INVENTORY', item: { id: Date.now(), ...recipe, craftedAt: Date.now() } });

    const rarity = RARITY_COLORS[recipe.rarity];
    showToast(`${recipe.emoji} ${recipe.name} 제작 완료! [${rarity.label}]`, 2500);
    setSelectedRecipe(null);
  }, [resources, dispatch, showToast]);

  return (
    <div>
      {/* 보유 재료 */}
      <div className="card">
        <div className="card-title">📦 보유 재료</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(MATERIALS).map(([key, mat]) => {
            const qty = resources[key] || 0;
            return (
              <span key={key} style={{
                padding: '4px 10px', background: qty > 0 ? 'var(--primary-soft)' : 'var(--bg-input)',
                borderRadius: 16, fontSize: 12,
                border: `1px solid ${qty > 0 ? 'rgba(255,138,61,0.2)' : 'var(--border-light)'}`,
                color: qty > 0 ? 'var(--text-bright)' : 'var(--text-dim)',
              }}>
                {mat.emoji} {mat.name} <strong>{qty}</strong>
              </span>
            );
          })}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[{ id: 'all', label: '전체' }, ...Object.entries(RECIPE_CATEGORIES).map(([id, label]) => ({ id, label }))].map(cat => (
          <button
            key={cat.id}
            className={`btn ${category === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap', borderRadius: 16 }}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 레시피 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(recipe => {
          const craftable = canCraft(recipe, resources);
          const rarity = RARITY_COLORS[recipe.rarity];
          const isSelected = selectedRecipe?.id === recipe.id;

          return (
            <div key={recipe.id}>
              <div
                className="card"
                style={{
                  marginBottom: 0,
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${rarity.text}` : undefined,
                  opacity: craftable ? 1 : 0.7,
                }}
                onClick={() => setSelectedRecipe(isSelected ? null : recipe)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: rarity.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {recipe.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-bright)' }}>{recipe.name}</span>
                      <span style={{
                        padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                        background: rarity.bg, color: rarity.text,
                      }}>
                        {rarity.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                      {recipe.description || RECIPE_CATEGORIES[recipe.category]}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{isSelected ? '▲' : '▼'}</div>
                </div>
              </div>

              {/* 확장 상세 */}
              {isSelected && (
                <div style={{
                  padding: 14, background: 'var(--bg-card)',
                  borderRadius: '0 0 var(--radius) var(--radius)',
                  borderTop: 'none', marginTop: -1,
                  border: `1px solid var(--border-light)`,
                  boxShadow: 'var(--shadow)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8 }}>
                    필요 재료
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {Object.entries(recipe.materials).map(([mat, qty]) => {
                      const have = resources[mat] || 0;
                      const enough = have >= qty;
                      const matInfo = MATERIALS[mat];
                      return (
                        <div key={mat} style={{
                          padding: '6px 12px',
                          background: enough ? '#e8f5e9' : '#ffebee',
                          border: `1px solid ${enough ? '#a5d6a7' : '#ef9a9a'}`,
                          borderRadius: 10, fontSize: 12,
                          color: enough ? '#2e7d32' : '#c62828',
                        }}>
                          {matInfo?.emoji} {matInfo?.name} <strong>{have}/{qty}</strong>
                          {enough ? ' ✓' : ' ✗'}
                        </div>
                      );
                    })}
                  </div>

                  {recipe.produces && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
                      생산: {recipe.produceEmoji} {recipe.produces}
                    </div>
                  )}

                  <button
                    className={`btn ${craftable ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', padding: 12, fontSize: 14, borderRadius: 10 }}
                    onClick={() => craft(recipe)}
                    disabled={!craftable}
                  >
                    {craftable ? `${recipe.emoji} 제작하기` : '재료 부족'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
