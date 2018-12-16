//
const unicode = require ('../../lib/unicode/unicode.js');
//
const rewritePattern = require ('regexpu-core');
//
const deferredSymbols = false;
//
module.exports.create = function (characters, params, highlightedCharacter)
{
    function updateDataPage (dataPage)
    {
        // Update pagination bar
        firstPageButton.disabled = (pageIndex === 0);
        firstPageButton.title = `First page: ${0 + 1}`;
        prevPageButton.disabled = (pageIndex === 0);
        prevPageButton.title = `Previous page: ${pageIndex - 1 + 1}`;
        if (pageSelect.value !== (pageIndex + 1))
        {
            pageSelect.value = pageIndex + 1;
        }
        pageSelect.disabled = (pages.length === 1);
        pageSelect.title = `Current page: ${pageIndex + 1}`;
        nextPageButton.disabled = (pageIndex === (pages.length - 1));
        nextPageButton.title = `Next page: ${pageIndex + 1 + 1}`;
        lastPageButton.disabled = (pageIndex === (pages.length - 1));
        lastPageButton.title = `Last page: ${pages.length}`;
        //
        let characters = pages[pageIndex];
        while (dataPage.firstChild)
        {
            dataPage.firstChild.remove ();
        }
        if (deferredSymbols)
        {
            params.observer = new IntersectionObserver
            (
                (entries, observer) =>
                {
                    entries.forEach
                    (
                        entry =>
                        {
                            if (entry.isIntersecting)
                            {
                                let symbol = entry.target;
                                if (symbol.textContent !== symbol.dataset.character)
                                {
                                    symbol.textContent = symbol.dataset.character;
                                    symbol.classList.remove ('deferred');
                                    observer.unobserve (symbol);
                                }
                            }
                        }
                    );
                },
                { root: params.root, rootMargin: '50% 0%' }
            );
        }
        let table = document.createElement ('table');
        table.className = 'data-table';
        //
        let hexDigits = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];
        //
        let header = document.createElement ('tr');
        header.className = 'digits-header';
        let emptyHeader = document.createElement ('th');
        emptyHeader.className = 'empty-header';
        emptyHeader.textContent = "";
        header.appendChild (emptyHeader);
        hexDigits.forEach
        (
            hexDigit =>
            {
                let digitHeader = document.createElement ('th');
                digitHeader.className = 'digit-header';
                digitHeader.textContent = hexDigit;
                header.appendChild (digitHeader);
            }
        );
        table.appendChild (header);
        //
        let flags = 'u';
        let pattern = rewritePattern ('(?=\\p{Script=Han})(?=\\p{Other_Letter})', flags, { unicodePropertyEscape: true, useUnicodeFlag: true });
        let regex = new RegExp (pattern, flags);
        let colCount = hexDigits.length;
        let colIndex = 0;
        let row;
        for (let character of characters)
        {
            let data = unicode.getCharacterBasicData (character);
            let isUnihanCharacter = regex.test (character);
            if ((colIndex % colCount) === 0)
            {
                row = document.createElement ('tr');
                row.className = 'row';
                table.appendChild (row);
                let rowHeader = document.createElement ('th');
                rowHeader.className = 'row-header';
                rowHeader.textContent = data.codePoint;
                row.appendChild (rowHeader);
            }
            let symbolCell = document.createElement ('td');
            symbolCell.className = 'symbol-cell';
            let symbol = document.createElement ('span');
            symbol.className = 'symbol';                
            if (isUnihanCharacter)
            {
                if (deferredSymbols)
                {
                    symbol.textContent = "\u3000";  // Ideographic space
                    symbol.classList.add ('deferred');
                    symbol.dataset.character = data.character;
                    params.observer.observe (symbol);
                }
                else
                {
                    symbol.textContent = data.character;
                }
                symbol.title = data.codePoint;
                if (character === highlightedCharacter)
                {
                    symbol.classList.add ('highlighted');
                    setTimeout (() => symbolCell.scrollIntoView ({ behavior: 'auto', block: 'nearest', inline: 'nearest' }));
                }
            }
            else
            {
                symbolCell.classList.add ('unassigned');
                symbol.textContent = "\u3000";  // Ideographic space
            }
            symbolCell.appendChild (symbol);
            row.appendChild (symbolCell);
            colIndex++;
        }
        //
        dataPage.appendChild (table);
    }
    //
    let pages;
    let pageIndex;
    //
    let dataTable = document.createElement ('div');
    //
    let paginationBar = document.createElement ('div');
    paginationBar.className = 'pagination-bar';
    //
    let navigationGroup = document.createElement ('div');
    navigationGroup.className = 'pagination-group';
    //
    const xmlns= 'http://www.w3.org/2000/svg';
    //
    let svg;
    let use;
    //
    let firstPageButton = document.createElement ('button');
    firstPageButton.type = 'button';
    firstPageButton.className = 'page-nav-button first-page-button';
    svg = document.createElementNS (xmlns, 'svg');
    svg.setAttributeNS (null, 'class', 'page-nav-icon');
    use = document.createElementNS (xmlns, 'use');
    use.setAttributeNS (null, 'href', 'images/navigation.svg#first-page');
    svg.appendChild (use);
    firstPageButton.appendChild (svg);
    firstPageButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (pageIndex > 0)
            {
                pageIndex = 0;
                updateDataPage (dataPage);
            }
        }
    );
    navigationGroup.appendChild (firstPageButton);
    //
    let prevPageButton = document.createElement ('button');
    prevPageButton.type = 'button';
    prevPageButton.className = 'page-nav-button prev-page-button';
    svg = document.createElementNS (xmlns, 'svg');
    svg.setAttributeNS (null, 'class', 'page-nav-icon');
    use = document.createElementNS (xmlns, 'use');
    use.setAttributeNS (null, 'href', 'images/navigation.svg#prev-page');
    svg.appendChild (use);
    prevPageButton.appendChild (svg);
    prevPageButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (pageIndex > 0)
            {
                pageIndex = pageIndex - 1;
                updateDataPage (dataPage);
            }
        }
    );
    navigationGroup.appendChild (prevPageButton);
    //
    let pageSelect = document.createElement ('input');
    pageSelect.type = 'number';
    pageSelect.className = 'page-select';
    pageSelect.addEventListener
    (
        'input',
        (event) =>
        {
            if (event.target.value !== "")
            {
                if (event.target.value < 1)
                {
                    event.target.value = 1;
                }
                else if (event.target.value > pages.length)
                {
                    event.target.value = pages.length;
                }
                pageIndex = event.target.value - 1;
                updateDataPage (dataPage);
            }
        }
    );
    pageSelect.addEventListener
    (
        'blur',
        (event) =>
        {
            if (event.target.value === "")
            {
                event.target.value = pageIndex + 1;
            }
        }
    );
    pageSelect.addEventListener
    (
        'keydown',
        (event) =>
        {
            if (event.key === "ArrowLeft")
            {
                event.preventDefault ();
                prevPageButton.click ();
            }
            else if (event.key === "ArrowRight")
            {
                event.preventDefault ();
                nextPageButton.click ();
            }
        }
    );
    navigationGroup.appendChild (pageSelect);
    //
    let nextPageButton = document.createElement ('button');
    nextPageButton.type = 'button';
    nextPageButton.className = 'page-nav-button next-page-button';
    svg = document.createElementNS (xmlns, 'svg');
    svg.setAttributeNS (null, 'class', 'page-nav-icon');
    use = document.createElementNS (xmlns, 'use');
    use.setAttributeNS (null, 'href', 'images/navigation.svg#next-page');
    svg.appendChild (use);
    nextPageButton.appendChild (svg);
    nextPageButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (pageIndex < (pages.length - 1))
            {
                pageIndex = pageIndex + 1;
                updateDataPage (dataPage);
            }
        }
    );
    navigationGroup.appendChild (nextPageButton);
    //
    let lastPageButton = document.createElement ('button');
    lastPageButton.type = 'button';
    lastPageButton.className = 'page-nav-button last-page-button';
    svg = document.createElementNS (xmlns, 'svg');
    svg.setAttributeNS (null, 'class', 'page-nav-icon');
    use = document.createElementNS (xmlns, 'use');
    use.setAttributeNS (null, 'href', 'images/navigation.svg#last-page');
    svg.appendChild (use);
    lastPageButton.appendChild (svg);
    lastPageButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (pageIndex < (pages.length - 1))
            {
                pageIndex = pages.length - 1;
                updateDataPage (dataPage);
            }
        }
    );
    navigationGroup.appendChild (lastPageButton);
    //
    paginationBar.appendChild (navigationGroup);
    //
    let pageInfoGroup = document.createElement ('div');
    pageInfoGroup.className = 'pagination-group';
    //
    let pageInfo = document.createElement ('div');
    pageInfo.className = 'page-info';
    //
    pageInfoGroup.appendChild (pageInfo);
    //
    paginationBar.appendChild (pageInfoGroup);
    //
    const pageSizes = [ 16, 32, 64, 128, 256 ];
    //
    let pageSizeGroup = document.createElement ('div');
    pageSizeGroup.className = 'pagination-group';
    //
    let pageSizeLabel = document.createElement ('label');
    let pageSizeSelect = document.createElement ('select');
    pageSizeSelect.className = 'page-size-select';
    pageSizes.forEach
    (
        (pageSize) =>
        {
            let pageSizeOption = document.createElement ('option');
            pageSizeOption.textContent = pageSize;
            pageSizeSelect.appendChild (pageSizeOption);
        }
    );
    //
    pageSizeLabel.appendChild (pageSizeSelect);
    let pageSizeText = document.createTextNode ("\xA0\xA0per page");
    pageSizeLabel.appendChild (pageSizeText);
    pageSizeGroup.appendChild (pageSizeLabel);
    //
    pageSizeSelect.value = params.pageSize;
    if (pageSizeSelect.selectedIndex < 0) // -1: no element is selected
    {
        pageSizeSelect.selectedIndex = 0;
    }
    //
    pageSizeSelect.addEventListener
    (
        'input',
        (event) =>
        {
            params.pageSize = parseInt (event.target.value);
            //
            // Paginate
            pages = [ ];
            for (let startIndex = 0; startIndex < characters.length; startIndex += params.pageSize)
            {
                pages.push (characters.slice (startIndex, startIndex + params.pageSize));
            }
            pageIndex = (highlightedCharacter) ? Math.trunc (characters.indexOf (highlightedCharacter) / params.pageSize) : 0;
            let pageCount = pages.length;
            pageSelect.min = 1;
            pageSelect.max = pageCount;
            pageSelect.value = pageIndex + 1;
            pageInfo.innerHTML = (pageCount > 1) ? `<strong>${pageCount}</strong>&nbsp;pages` : "";
            updateDataPage (dataPage);
        }
    );
    //
    paginationBar.appendChild (pageSizeGroup);
    //
    dataTable.appendChild (paginationBar);
    let dataPage = document.createElement ('div');
    dataTable.appendChild (dataPage);
    //
    pageSizeSelect.dispatchEvent (new Event ('input'));
    //
    return dataTable;
}
//
