#!/bin/bash
# Re-downloads all readlog images from Substack S3 into ./images/
# Flat layout: filenames are prefixed with the month/post slug.
set -e
BASE="https://substack-post-media.s3.amazonaws.com/public/images"
cd "$(dirname "$0")"
mkdir -p images

download() {
  local id="$1"
  local out="$2"
  echo "-> images/$out"
  curl -sSL --fail -o "images/$out" "${BASE}/${id}"
}

# March
download "59703b62-b613-40d1-8cb9-99d5357cf1a1_1258x1616.png"    "march-01-ben-barres.png"
download "331eb9eb-4524-493f-bc07-5ca6494e6ca3_4096x3072.jpeg"   "march-02-mountains-of-madness-a.jpeg"
download "397bd3b5-907a-4b56-8b38-1bb5b35d08ba_4096x3072.jpeg"   "march-03-mountains-of-madness-b.jpeg"
download "66039ffc-7309-4605-8f7a-330d7028bdf1_1036x906.png"     "march-04-brain-projector-integrator.png"
download "606518cc-bd4b-49e8-82a0-873767a0279e_1944x2597.jpeg"   "march-05-nastenka-watercolor.jpeg"
download "6197adaf-0df8-4328-96cb-547952d4a5db_736x736.jpeg"     "march-06-story-pin.jpeg"
download "11247f6b-4005-440b-b9e7-c65ca807ca64_968x184.png"      "march-07-daily-reminder.png"
download "f2858864-8b18-4ff3-b8e6-1c9e8c2fac5e_736x736.jpeg"     "march-08-dostoyevsky-quote.jpeg"
download "59c2a806-d8f5-4f4b-9dba-6d0b244c071e_594x591.jpeg"     "march-09-kitchen-sink.jpeg"
download "2206de70-216e-401f-b14f-4b8ee81f2ba9_987x744.png"      "march-10-misc.png"
download "5edb8e56-abb5-474b-8283-762252262b63_736x736.jpeg"     "march-11-two-birds.jpeg"

# November
download "33513315-78ff-4205-89c8-6436075a87db_1024x559.jpeg"    "november-01-kardashev.jpeg"

# October
download "8cd2b9f4-c088-41bc-866e-424ddd769d3e_2048x1536.png"    "october-01-electricity-generator.png"
download "477601fb-aa27-41d0-a446-d1c3b4006116_2048x957.jpeg"    "october-02-microtribes.jpeg"
download "b25e0db1-a6dd-4362-907d-46422a74bea0_2048x1091.png"    "october-03-ah-q.png"
download "96276a56-99f6-4893-964c-09f6d826b68f_766x425.webp"     "october-04-paratactic.webp"
download "1558d2f7-2a57-4e14-b847-cf18c05b6f4e_1536x2048.png"    "october-05-ceramics.png"

# September
download "4ce7fcea-ab14-4f02-a2fd-4264503dc0c2_1406x746.png"     "september-01-flowers-for-algernon.png"
download "e9be71e7-f06e-4d24-95b8-beef0a9aebff_2048x1536.png"    "september-02-tokyo-a.png"
download "0a7b517f-e526-4afe-8f3d-3076906ed371_960x1280.jpeg"    "september-03-tokyo-b.jpeg"
download "4a8fb1e1-590b-442f-a018-347e70c052ac_1042x1280.png"    "september-04-consciousness-diagram.png"
download "08d38e8b-9ec2-4432-b106-1855af7a7571_245x200.webp"     "september-05-exile-sticker.webp"

# Early May
download "cb99ba87-9240-47a6-ae56-f6f967b227be_2058x1548.png"    "early-may-01-header.png"
download "46a41d2b-12d5-4bb4-8a72-abd57702a2ee_1202x810.png"     "early-may-02-mri-facility.png"
download "8381d6e7-9986-4c90-9dcf-db4f316e1a5f_1216x1008.jpeg"   "early-may-03-study2-setup.jpeg"
download "a2f627b0-520e-46fa-a2c9-4c623e1cf5a3_672x958.jpeg"     "early-may-04-transducer-prep.jpeg"
download "8beb1f50-349b-47f1-b49a-9e9ec149cfc3_643x452.png"      "early-may-05-errors-analysis.png"

echo "DONE — $(ls images/ | wc -l | tr -d ' ') files"
