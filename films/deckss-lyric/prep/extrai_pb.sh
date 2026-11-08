#!/bin/bash
# Extrai cada vídeo da banda em P&B de alto contraste com grão, 30 fps, lado menor 720. Uso: extrai_pb.sh (na pasta footage)
set -e
TRAT="format=gray,curves=all='0/0 0.18/0.06 0.5/0.5 0.82/0.95 1/1',noise=alls=9:allf=t"
ext(){ n=$1; src=$2; pre=$3; mkdir -p pb/$n; ffmpeg -v error -y -i "$src" -vf "fps=30,${pre}scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)',$TRAT" -q:v 5 pb/$n/f%04d.jpg; echo "$n $(ls pb/$n | wc -l)"; }
ext vocal-7498 IMG_7498.MOV ""
ext vocal-7501 IMG_7501.MOV ""
ext vocal-7503 IMG_7503.MOV ""
ext vocal-7522 IMG_7522.MOV ""
ext vocal-0342 lv_0_20261108130342.mp4 ""
ext guit-0043 VID-20260926-WA0043.mp4 ""
ext guit-0046 VID-20260926-WA0046.mp4 ""
ext guit-0047 VID-20260926-WA0047.mp4 ""
ext guit-0049 VID-20260926-WA0049.mp4 ""
ext guit-1006 lv_0_20261108131006.mp4 "crop=ih*9/16:ih,"
ext baixo-1252 lv_0_20261108131252.mp4 ""
ext bateria-1317 lv_0_20261108131317.mp4 ""
ext estudio-1400 lv_0_20261108131400.mp4 "crop=iw:iw*9/16,"
ext guit2-1606 lv_0_20261108131606.mp4 ""
