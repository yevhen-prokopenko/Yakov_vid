#!/bin/zsh
# Loudness-normalizes a raw render (two-pass, -14 LUFS / -1.5 dBTP, video copied) and writes QA files.
# Usage: scripts/finish.sh <raw.mp4> <final.mp4>
set -e
raw=$1; out=$2; base=${out:r}
m=$(ffmpeg -hide_banner -i $raw -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
v() { print -r -- $m | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/' }
ffmpeg -v error -y -i $raw -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart $out
mkdir -p ${out:h}/review
name=${out:t:r}
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate -of compact $out > ${out:h}/review/${name}_probe.txt
ffmpeg -v error -i $out -f null - 2> ${out:h}/review/${name}_decode_errors.txt
ffmpeg -hide_banner -i $out -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > ${out:h}/review/${name}_loudness.txt
ffmpeg -v error -y -i $out -vf "fps=1/3,scale=216:384,tile=5x5" -frames:v 1 ${out:h}/review/${name}_contact.jpg
