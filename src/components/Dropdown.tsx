import React from 'react';
import cn from 'classnames';

interface DropdownProps {
  selected: any;
  options: readonly { name: string; value: any }[];
  onChange: (value: any) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  selected,
  options,
  onChange,
}) => {
  const [hidden, setHidden] = React.useState(true);
  const close = React.useCallback(() => {
    document.removeEventListener('click', close);
    setHidden(true);
  }, []);
  const title = options.find((x) => x.value === selected)?.name ?? '';
  return (
    <div className="dropdown is-active">
      <div className="dropdown-trigger">
        <button
          className="button"
          aria-haspopup="true"
          onClick={(e) => {
            e.preventDefault();
            if (hidden) {
              setHidden(false);
              setTimeout(() => document.addEventListener('click', close), 0);
            } else {
              close();
            }
          }}
        >
          <span>{title}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div
        className="dropdown-menu"
        role="menu"
        style={{ visibility: hidden ? 'hidden' : 'visible' }}
      >
        <div
          className="dropdown-content"
          style={{ maxHeight: '16em', overflowY: 'auto' }}
        >
          {options.map(({ name, value }) => (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={value}
              href="#"
              className={cn('dropdown-item', {
                'is-active': selected === value,
              })}
              onClick={(e) => {
                e.preventDefault();
                close();
                onChange(value);
              }}
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
