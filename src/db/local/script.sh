#!/bin/bash
set -e
set -o pipefail

tmdb_response="./src/db/local/tools/tmdb.json"
genres_seed="./src/db/local/seeds/genres.sql"
movies_seed="./src/db/local/seeds/movies.sql"
movie_genre_seed="./src/db/local/seeds/movie_genre.sql"

# Scrape TMDB genres
curl --fail -s --request GET \
  --url "https://api.themoviedb.org/3/genre/movie/list?language=en" \
  --header "Authorization: Bearer $TMDB_API_KEY" \
  --header "accept: application/json" \
  | jq -r '
    "INSERT INTO genre (" + (.genres[0] | keys | join(", ")) + ") VALUES\n" +
    (
      .genres
      | map(
        "(\(.id), '"'"'\(.name)'"'"')"
      ) | join(",\n")
    ) + ";"
  ' > "$genres_seed"

# Scrape all TMDB top rated movies
printf '{"results":[' > "$tmdb_response"
for i in {1..500}; do
  curl --fail -s --request GET \
    --url "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=$i" \
    --header "Authorization: Bearer $TMDB_API_KEY" \
    --header "accept: application/json" \
    | jq -c -j "[.results[]]" >> "$tmdb_response"
    if [ $i -ne 500 ]; then
      printf ",\n" >> "$tmdb_response"
    fi
done
printf "]}\n" >> "$tmdb_response"

# Generate movies seed
jq -r '
  "INSERT INTO movie ("+ (.results[0][0] | keys | join(", ")) + ") VALUES\n" +
  (
    .results
    | add
    | map(select(
      values
      | all(
        . != null and . != "" and . != []
      )
    ))
    | map(
      "(" + (
        map(
          tostring
          | gsub("'"'"'"; "'"'"''"'"'")
          | "'"'"'\(.)'"'"'"
        ) | join(", ")
      ) + ")"
    ) | join(",\n")
  ) + ";"
' "$tmdb_response" > "$movies_seed"

# Generate movie to genres relation seed
jq -r '
  "INSERT INTO movie_genre (movie_id, genre_id) VALUES\n" +
  (
    .results
    | add
    | map(select(
      values
      | all(
        . != null and . != "" and . != []
      )
    ))
    | map(.id as $id
      | .genre_ids
      | map("(\($id), \(.))")
      | join(",\n")
    ) | join(",\n")
  ) + ";"
' "$tmdb_response" > "$movie_genre_seed"

# movies_list="./src/constants/movies-list.ts"
# Generate movies list for autocomplete
# jq -r '
#   "export const MOVIE_LIST: MovieList[] = " +
#   (
#     .results
#     | add
#     | map(select(
#       values
#       | all(
#         . != null and . != "" and . != []
#       )
#     ))
#     | map({
#       id,
#       title,
#       year: (.release_date | split("-")[0] | tonumber)
#     }) | tostring) + ";\n" +
#   "export type MovieList = { id: number, title: string, year: number };"
# ' "$tmdb_response" > "$movies_list"
