export function toListItem(detail, type) {
  return {
    id: detail.id,
    type,
    title: detail.title,
    name: detail.name,
    poster_path: detail.poster_path,
    backdrop_path: detail.backdrop_path,
    vote_average: detail.vote_average,
    release_date: detail.release_date,
    first_air_date: detail.first_air_date,
    media_type: type,
  };
}
