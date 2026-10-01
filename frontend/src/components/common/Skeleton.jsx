import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="card" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height="180px" borderRadius="var(--radius-md)" />
      <Skeleton width="60%" height="16px" />
      <Skeleton width="90%" height="20px" />
      <Skeleton width="40%" height="16px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <Skeleton width="45%" height="24px" />
        <Skeleton width="40%" height="24px" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <Skeleton height="18px" width={i === 0 ? '70%' : '90%'} />
        </td>
      ))}
    </tr>
  );
};
