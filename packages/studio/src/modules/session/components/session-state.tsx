import { useChartingThemeContext } from '../../charting/charting-theme-context';

export function SessionState() {
  const { theme } = useChartingThemeContext();

  const logo = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M491 416.625C491 446.103 467.037 470 437.477 470C407.918 470 383.955 446.103 383.955 416.625C383.955 387.147 407.918 363.25 437.477 363.25C467.037 363.25 491 387.147 491 416.625Z"
        fill="#888"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M342.001 440.936C310.317 459.412 273.444 470 234.091 470C115.852 470 20 374.413 20 256.5C20 138.587 115.852 43 234.091 43C352.33 43 448.182 138.587 448.182 256.5C448.182 278.982 444.697 300.653 438.237 321.005C383.78 326.008 341.136 371.688 341.136 427.3C341.136 431.92 341.431 436.471 342.001 440.936ZM362.545 256.5C362.545 327.248 305.034 384.6 234.091 384.6C163.147 384.6 105.636 327.248 105.636 256.5C105.636 185.752 163.147 128.4 234.091 128.4C305.034 128.4 362.545 185.752 362.545 256.5Z"
        fill="#888"
      />
    </svg>
  );

  return (
    <div
      className="flex items-center p-2"
      style={{
        background: `linear-gradient(${theme.backgroundTopColor}, ${theme.backgroundBottomColor})`
      }}
    >
      <div className="mr-1">{logo} </div>
      <div className="text-right font-mono text-xs text-slate-100 opacity-50">
        Connected
      </div>
    </div>
  );
}
