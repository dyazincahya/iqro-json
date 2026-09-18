# Debug Session: iqro-inner-scroll
- **Status**: [OPEN]
- **Issue**: Konten Iqro yang terpotong tidak dapat digulir secara horizontal maupun vertikal di kontainer, pada desktop dan mobile.
- **Debug Server**: Pending startup
- **Log File**: .dbg/trae-debug-log-iqro-inner-scroll.ndjson

## Reproduction Steps
1. Buka halaman pembaca Iqro pada mobile atau desktop.
2. Buka halaman yang kontennya lebih tinggi atau lebih lebar daripada bingkai halaman.
3. Coba gulir di dalam bingkai teks Iqro.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Tinggi area scroll sama dengan tinggi konten sehingga `scrollHeight` tidak melebihi `clientHeight`. | High | Low | Pending |
| B | Salah satu pembungkus Flexbox tidak meneruskan batas tinggi sehingga area scroll tidak pernah dibatasi. | High | Low | Pending |
| C | Area scroll berada di balik elemen overlay atau tidak menerima gestur sentuh. | Medium | Low | Pending |
| D | Lebar konten menyusut atau membungkus sehingga tidak pernah memicu overflow horizontal. | Medium | Low | Pending |

## Log Evidence
Belum ada.

## Verification Conclusion
Belum ada.
