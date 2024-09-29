 const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const elementName = document.getElementById('element-name');
        const elementDescription = document.getElementById('element-description');
        const elementExample = document.getElementById('element-example');

        function searchElement() {
            const query = searchInput.value.toLowerCase();
            if (htmlDictionary.hasOwnProperty(query)) {
                const element = htmlDictionary[query];
                elementName.textContent = query;
                elementDescription.textContent = element.description;
                elementExample.textContent = element.example;
            } else {
                elementName.textContent = 'Element not found';
                elementDescription.textContent = '';
                elementExample.textContent = '';
            }
        }

        searchButton.addEventListener('click', searchElement);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchElement();
            }
        });
