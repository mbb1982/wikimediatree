import { useFetch } from 'use-http';

const FlickrImages = ({tag}) =>
{
   const {loading, error, data} = useFetch(`/api/flickr/by_tag/${tag}`, {}, [tag]);

    if (loading) return <div>Loading images...</div>;
    if (error) return <div>Error loading images: {error.message}</div>;
    
   return (
      <div>
        {data.map((item, index) => (
          <div key={index}>
            <img src={item.url} alt={item.title} />
          </div>
        ))}
      </div>
   );
};

export default FlickrImages;