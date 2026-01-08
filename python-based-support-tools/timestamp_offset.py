"""Offset the timestamp column in a CSV so the first time becomes midnight.

Usage (no flags needed if you use the default path):
	python timestamp_offset.py

Optional flags (override defaults):
	python timestamp_offset.py --input "C:/path/to/file.csv" --column timestamp

Outputs a new file in the same directory named:
	OffsetTimestamp_Copy_<original_filename>.csv

Output columns:
	1) x_offset_timestamp (prefixed with original HH_MM_SS_mmm)
	2) original_timestamp
	3+) remaining original columns

Timestamps are written as ISO 8601 local datetime with milliseconds (e.g. 2026-01-06T00:00:00.000).
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

import pandas as pd


def offset_timestamps(input_path: Path, timestamp_column: str = "timestamp") -> Path:
	"""Create a copy of the CSV with timestamps shifted so the first row is midnight.

	Args:
		input_path: Path to the source CSV.
		timestamp_column: Name of the column containing timestamp strings.

	Returns:
		Path to the newly written CSV.
	"""

	if not input_path.exists():
		raise FileNotFoundError(f"Input file not found: {input_path}")

	df = pd.read_csv(input_path)
	if timestamp_column not in df.columns:
		raise KeyError(f"Column '{timestamp_column}' not found in {input_path.name}")

	ts_series = pd.to_datetime(df[timestamp_column], errors="coerce")
	if ts_series.isna().all():
		raise ValueError(f"Column '{timestamp_column}' could not be parsed as datetimes.")

	first_ts = ts_series.iloc[0]
	if pd.isna(first_ts):
		raise ValueError("First timestamp is missing or invalid.")

	midnight = first_ts.normalize()  # same date, time set to 00:00:00
	delta = first_ts - midnight

	shifted = ts_series - delta
	# Ensure ISO 8601 local datetime with millisecond precision.
	formatted = shifted.dt.strftime("%Y-%m-%dT%H:%M:%S.%f").str.slice(0, 23)

	first_ms = int(first_ts.microsecond / 1000)
	prefix = f"{first_ts.hour:02d}_{first_ts.minute:02d}_{first_ts.second:02d}_{first_ms:03d}"
	new_col_name = f"{prefix}_offset_timestamp"

	df_copy = df.copy()
	# Insert the offset column first, keep original as the second column renamed to original_timestamp.
	df_copy.insert(0, new_col_name, formatted)
	df_copy.rename(columns={timestamp_column: "original_timestamp"}, inplace=True)

	output_path = input_path.parent / f"OffsetTimestamp_Copy_{input_path.name}"
	df_copy.to_csv(output_path, index=False)
	return output_path


def parse_args(argv: list[str]) -> argparse.Namespace:
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument(
		"--input",
		type=Path,
		help="Path to the source CSV file. Defaults to the expected Charger CSV alongside this script.",
	)
	parser.add_argument(
		"--column",
		default="timestamp",
		help="Name of the timestamp column (default: timestamp).",
	)
	return parser.parse_args(argv)


def main(argv: list[str]) -> int:
	args = parse_args(argv)

	default_input = Path(
		"C:/Users/annmo/Desktop/Charger/Charger_when_SOC_Full_on_Cluster_can_recording_20260106_165537.csv"
	)
	input_path = args.input or default_input
	try:
		output_path = offset_timestamps(input_path, args.column)
	except Exception as exc:  # pragma: no cover - CLI surface
		print(f"Error: {exc}")
		return 1

	print(f"Wrote offset CSV to: {output_path}")
	return 0


if __name__ == "__main__":
	raise SystemExit(main(sys.argv[1:]))
