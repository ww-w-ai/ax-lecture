#!/bin/bash
# deck 소스 백업-diff (git 추적 불필요). 사용: deck-snap.sh snap | diff
ROOT="/Users/taehyoungkim/Documents/덥덥덥/강연/ax-lecture"
B="$ROOT/html/.baseline"
case "$1" in
  snap)
    mkdir -p "$B"; cp "$ROOT"/html/*.html "$B"/ 2>/dev/null
    echo "baseline 스냅샷 완료 ($(ls "$B"/*.html 2>/dev/null | wc -l | tr -d ' ') files)";;
  diff)
    any=0
    for f in "$ROOT"/html/*.html; do
      n=$(basename "$f")
      [ -f "$B/$n" ] || { echo "=== $n (신규, 백업 없음) ==="; any=1; continue; }
      if ! diff -q "$B/$n" "$f" >/dev/null 2>&1; then
        echo "=== $n ==="; diff -u "$B/$n" "$f"; any=1
      fi
    done
    [ "$any" = 0 ] && echo "(baseline 대비 변경 없음)";;
  *) echo "usage: deck-snap.sh snap | diff";;
esac
