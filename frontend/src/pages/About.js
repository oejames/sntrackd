import React from 'react';

const About = () => {
  return (
    <div className="bg-[#14181c] min-h-screen text-[#9ab] py-12">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">About SNL Trackd</h1>
        
        <div className="space-y-6">
        <p>
            Credit to twitter user @colinjoist for coming up with the concept. 
            {/* in this tweet: <a href="https://x.com/colinjoist/status/1871372906665787572">x.com/colinjoist/status/1871372906665787572</a>. */}
          </p>
          <p>
            SNL Trackd pulls sketches from the SNL Youtube channel (every video > 60 seconds in length), meaning there's >7k videos. Unfortunately, this also means sketches that aren't on the channel aren't here, but the rest of the archive will be added soon.
          
          
          
          </p>
         
          <p>
            If you can't find a sketch, search for its title exactly as it appears on SNL's Youtube Channel. 
          </p>
          <p>
            If there's a sketch you really want to see that isn't on SNL's Youtube Channel, the rest of the archive will be added soon. 


          
           
          </p>
          <p>
            Please feel free to report bugs or recommend features to  <a 
                href="mailto:snltrackd@gmail.com" 
                className="text-[#00c030] hover:text-[#00e054]"
              >
                snltrackd@gmail.com
              </a>.
              </p>

              <p>If you're enjoying the site, consider leaving a tip to support the costs of running the site:
                <a href='https://buymeacoffee.com/snltrackd' className='text-[#00e054]'>  buymeacoffee.com/snltrackd</a>.
              </p>
          
          <p>
            Lastly, do not forget your password as there is no way to retrieve it. 
          </p>
          
          {/* <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Our Mission</h2>
          <p>
            We believe in creating a supportive ecosystem where artists can showcase their 
            work, connect with like-minded creators, and receive constructive feedback.
          </p> */}
          
          <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Features</h2>
          <p>
            Right now on the site you can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Leave reviews and ratings for any sketch on SNL's Youtube Channel</li>
            <li>Add profile bios and four favorites</li>
            <li>Follow other users and view their activity in the Activity page</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Coming Soon</h2>
          <p>
            Coming Soon:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Lists</li>
            <li>Liking/favoriting sketches</li>
            <li>Pinned reviews on profiles</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Community Guidelines</h2>
          <p>
            {/* We're committed to maintaining a respectful, inclusive, and inspiring environment.  */}
            Be kind, constructive, and respectul.
          </p>
          
          <div className="bg-[#2c3440] p-6 rounded-lg mt-8">
            <p className="text-white font-semibold mb-2">Questions or feedback?</p>
            <p>
             Always looking to improve or take feedback. Reach out at{' '}
              <a 
                href="mailto:snltrackd@gmail.com" 
                className="text-[#00c030] hover:text-[#00e054]"
              >
                snltrackd@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;