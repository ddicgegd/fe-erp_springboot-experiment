import React from 'react';

const SkeletonRow: React.FC = () => (
  <tr className="border-t border-gray-100 dark:border-white/5 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <td key={i} className="py-2 px-3">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-xl w-3/4" />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;
