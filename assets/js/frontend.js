document.addEventListener("DOMContentLoaded", function () {
  // Set grid columns based on number of videos (fallback for browsers without :has support)
  const videoGrid = document.querySelector(".video-gallery-grid");
  if (videoGrid) {
    const videoItems = videoGrid.querySelectorAll(".video-gallery-item");
    const itemCount = videoItems.length;

    // Add the appropriate class based on count
    if (itemCount === 1) {
      videoGrid.classList.add("grid-cols-1");
    } else if (itemCount === 2) {
      videoGrid.classList.add("grid-cols-2");
    } else if (itemCount === 3) {
      videoGrid.classList.add("grid-cols-3");
    } else {
      videoGrid.classList.add("grid-cols-4");
    }
  }

  // Check if popup container exists, if not create it
  let popup = document.querySelector(".video-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "video-popup";
    popup.innerHTML = '<div class="video-popup-content"></div>';
    document.body.appendChild(popup);
  }

  // Add click event to video thumbnails for fullscreen popup
  document.querySelectorAll(".video-gallery-item").forEach((item) => {
    const videoElement = item.querySelector("video");

    // Create play overlay for better UX
    const playOverlay = document.createElement("div");
    playOverlay.className = "play-overlay";
    playOverlay.innerHTML = '<div class="play-button"></div>';

    // Add the play overlay to the video wrapper
    const videoWrapper = item.querySelector(".video-wrapper");
    if (videoWrapper) {
      videoWrapper.appendChild(playOverlay);
    } else {
      item.appendChild(playOverlay);
    }

    // Add hover effect to show thumbnail preview
    if (videoElement) {
      item.addEventListener("mouseenter", function () {
        // Play video briefly on hover without sound (muted)
        try {
          videoElement.currentTime = 0.5; // Skip the first half-second
          videoElement.play().catch((e) => console.log("Preview play error:", e));
        } catch (err) {
          console.log("Video preview error:", err);
        }
      });

      item.addEventListener("mouseleave", function () {
        // Pause on mouse leave
        try {
          videoElement.pause();
          videoElement.currentTime = 0; // Reset position
        } catch (err) {
          console.log("Video pause error:", err);
        }
      });

      // Add error handling for video element
      videoElement.addEventListener("error", function () {
        console.log("Video error occurred");
        const errorMessage = document.createElement("div");
        errorMessage.className = "video-error-message";
        errorMessage.textContent = "Media error: Format not supported or source not found";

        // Replace video with error message
        if (!item.querySelector(".video-error-message")) {
          const wrapper = item.querySelector(".video-wrapper");
          if (wrapper) {
            // Keep the video element but add error overlay
            const errorOverlay = document.createElement("div");
            errorOverlay.className = "error-overlay";
            errorOverlay.appendChild(errorMessage);
            wrapper.appendChild(errorOverlay);
          }
        }
      });
    }

    // Make the entire video item clickable, not just the play button
    const openVideoPopup = function () {
      if (!videoElement) return;

      let videoSrc = "";
      let videoType = "";

      // Get source from source element if exists
      const sourceElement = videoElement.querySelector("source");
      if (sourceElement) {
        videoSrc = sourceElement.src;
        videoType = sourceElement.type || "video/mp4";
      } else if (videoElement.src) {
        // Fallback to video src if no source element
        videoSrc = videoElement.src;
        videoType = "video/mp4";
      }

      if (!videoSrc) {
        console.error("No video source found");
        return;
      }

      // Get video title from data attribute
      const videoTitle = item.getAttribute("data-video-title") || "";

      const popupContent = document.querySelector(".video-popup-content");
      popupContent.innerHTML = `
        <video controls autoplay>
          <source src="${videoSrc}" type="${videoType}">
          Your browser does not support the video tag.
        </video>
        <button class="close-popup">&times;</button>
        ${videoTitle ? `<div class="popup-video-title">${videoTitle}</div>` : ""}
      `;

      // Add error handling for popup video
      const popupVideo = popupContent.querySelector("video");
      if (popupVideo) {
        popupVideo.addEventListener("error", function () {
          popupContent.innerHTML = `
            <div class="video-error">
              <p>Media error: Format not supported or source not found</p>
              <p>Video URL: ${videoSrc}</p>
            </div>
            <button class="close-popup">&times;</button>
          `;
        });
      }

      popup.style.display = "block";

      // Add keyboard support (Esc to close)
      document.addEventListener("keydown", closeOnEscape);
    };

    // Add click handlers to both the play overlay and the video itself
    playOverlay.addEventListener("click", openVideoPopup);
    if (videoElement) {
      videoElement.addEventListener("click", openVideoPopup);
    }

    // Make entire wrapper clickable for better UX
    if (videoWrapper) {
      videoWrapper.addEventListener("click", openVideoPopup);
    }
  });

  // Close popup function
  function closePopup() {
    const popup = document.querySelector(".video-popup");
    if (popup) {
      popup.style.display = "none";
      const video = popup.querySelector("video");
      if (video) video.pause();
    }
    document.removeEventListener("keydown", closeOnEscape);
  }

  // Close on escape key
  function closeOnEscape(e) {
    if (e.key === "Escape") closePopup();
  }

  // Close popup on click
  document.addEventListener("click", function (e) {
    const popup = document.querySelector(".video-popup");
    if (popup && (e.target.closest(".close-popup") || e.target === popup)) {
      closePopup();
    }
  });
});
