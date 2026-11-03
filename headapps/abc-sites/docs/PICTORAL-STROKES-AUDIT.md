# Pictoral stroke asset audit

This audit records why `public/icons/strokes` remains in the approved icon registry.

The 51 stroke files were introduced in commit `2642f5e` and were still present on
`origin/develop` before this review. Commit `2487d91` removed them and described them in a test as
an editable duplicate set, but the commit and repository contain no design approval or source
export that authorizes that deletion.

The committed Figma inventory on `origin/develop` provides distinct provenance for every pair:

- 51 full-color `pictoral/<name>` entries use Figma nodes in the published Pictoral set and have
  `colorMode: multicolor`;
- 51 `pictoral/<name>` entries use different Figma node IDs and have
  `colorMode: monochrome`;
- every stroke entry has one same-named full-color counterpart;
- all 51 stroke SVG Git blobs differ byte-for-byte from their counterparts; and
- structural comparison shows different path data and paint attributes. For example,
  `pictoral/cpr` uses fixed abc palette fills while `pictoral/cpr` uses stroked
  `currentColor` geometry.

The source Figma section at node `18513:457652` was also inspected on September 23, 2026. It
visibly contains two separate 51-icon grids labeled `Icon/Pictoral` and
`Icon/Pictoral [EDITABLE]`, consistent with the distinct full-color and stroke exports recorded in
the inventory.

The runtime asset test checks every pair remains present, has the correct color mode, and does not
become byte-identical. Deleting the stroke set still requires an authoritative decision from the
abc design-system owner plus an updated Figma export and inventory.
