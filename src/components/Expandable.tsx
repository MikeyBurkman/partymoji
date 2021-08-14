import React from 'react';
import cn from 'classnames';

interface ExpandableProps {
  mainEle: JSX.Element;
}

export const Expandable: React.FC<ExpandableProps> = ({
  mainEle,
  children,
}) => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <div>
      <div
        className="is-clickable columns"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="column is-four-fifths">{mainEle}</div>
        <span className="icon column">
          <i
            className={cn(
              'fas',
              collapsed ? 'fa-chevron-up' : 'fa-chevron-down'
            )}
          ></i>
        </span>
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  );
};
