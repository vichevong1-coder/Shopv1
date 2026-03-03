interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const sizes = { sm: 16, md: 24, lg: 48 };

const Spinner = ({ size = 'md', fullPage = false }: Props) => {
  const px = sizes[size];

  const el = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className="spinner"
    >
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#111827"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        {el}
      </div>
    );
  }

  return el;
};

export default Spinner;
