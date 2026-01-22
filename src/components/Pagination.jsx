export default function Pagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  const items = [];
  const maxButtons = 7;

  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  for (let p = start; p <= end; p++) items.push(p);

  return (
    <nav className="d-flex justify-content-end">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPage(page - 1)}>
            Prev
          </button>
        </li>

        {start > 1 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => onPage(1)}>1</button>
            </li>
            {start > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
          </>
        )}

        {items.map((p) => (
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => onPage(p)}>
              {p}
            </button>
          </li>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            <li className="page-item">
              <button className="page-link" onClick={() => onPage(totalPages)}>
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPage(page + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
