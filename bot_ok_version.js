// ==UserScript==
// @name         Cityline HK Ticket Assistant
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Cityline HK helper
// @match        https://*.cityline.com/*
// @grant        none
// @license      MIT
// @author       hkcitytbothttps://t.me/+9plWrQDSwQMxMDA1
// @run-at document-idle
// @downloadURL https://github.com/hkcitytbot/hkcitybot/raw/Master/bot_ok_version.js
// @updateURL https://github.com/hkcitytbot/hkcitybot/raw/Master/bot_ok_version.js
// @license Copyright hkcitytbot
// ==/UserScript==

(function() {
    'use strict';

    let reloadInterval = 60000; // 60 seconds
    let msgRetryInterval = 4000; // 4 seconds
    let isActive = true;
    let isPageReloadEnabled = false; // Page reload is disabled by default
    let clickInterval;
    let isStatusBarExpanded = true;

    const validFrom = new Date('2024-10-01T00:00:00+08:00');
    const validTo = new Date('2024-10-31T23:59:59+08:00');

    const targetURL_ENG = 'https://shows.cityline.com/tc/2024/accusefivehk.html?actionType=5&lang=en'; // 替換為您想要針對的特定URL
    const targetURL_TW = 'https://shows.cityline.com/tc/2024/accusefivehk.html?actionType=5&lang=TW'; // 替換為您想要針對的特定URL
    const targetURL_CN = 'https://shows.cityline.com/tc/2024/accusefivehk.html?actionType=5&lang=CN'; // 替換為您想要針對的特定URL

    const statusBar = document.createElement('div');
    statusBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 9999;
        transition: height 0.3s ease;
    `;

    const statusBarContent = document.createElement('div');
    statusBarContent.style.cssText = `
        height: 130px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        padding: 0 20px;
    `;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '▲';
    toggleButton.style.cssText = `
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        border-radius: 0 0 5px 5px;
        padding: 5px 10px;
        cursor: pointer;
    `;

    statusBar.appendChild(statusBarContent);
    statusBar.appendChild(toggleButton);

    const topRow = document.createElement('div');
    topRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 5px;
    `;

    const leftText = document.createElement('span');
    leftText.textContent = 'Auto-reload active';
    leftText.style.flexBasis = '33%';

    const middleText = document.createElement('span');
    middleText.textContent = '你正在使用HK reloader';
    middleText.style.flexBasis = '33%';
    middleText.style.textAlign = 'center';

    const countdownText = document.createElement('span');
    countdownText.style.flexBasis = '33%';
    countdownText.style.textAlign = 'right';

    topRow.appendChild(leftText);
    topRow.appendChild(middleText);
    topRow.appendChild(countdownText);

    const middleRow = document.createElement('div');
    middleRow.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '5';
    slider.max = '300';
    slider.value = reloadInterval / 1000;
    slider.style.width = '200px';

    const sliderLabel = document.createElement('span');
    sliderLabel.textContent = 'Page reload interval (seconds): ';
    sliderLabel.style.marginRight = '10px';

    const sliderValue = document.createElement('span');
    sliderValue.textContent = slider.value;
    sliderValue.style.marginLeft = '10px';
    sliderValue.style.marginRight = '20px';

    const reloadCheckbox = document.createElement('input');
    reloadCheckbox.type = 'checkbox';
    reloadCheckbox.checked = isPageReloadEnabled;
    reloadCheckbox.style.marginLeft = '20px';

    const reloadCheckboxLabel = document.createElement('span');
    reloadCheckboxLabel.textContent = 'Enable page reload';
    reloadCheckboxLabel.style.marginLeft = '5px';

    middleRow.appendChild(sliderLabel);
    middleRow.appendChild(slider);
    middleRow.appendChild(sliderValue);
    middleRow.appendChild(reloadCheckbox);
    middleRow.appendChild(reloadCheckboxLabel);

    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    `;

    const msgSlider = document.createElement('input');
    msgSlider.type = 'range';
    msgSlider.min = '1';
    msgSlider.max = '30';
    msgSlider.value = msgRetryInterval / 1000;
    msgSlider.style.width = '200px';

    const msgSliderLabel = document.createElement('span');
    msgSliderLabel.textContent = 'MSG retry interval (seconds): ';
    msgSliderLabel.style.marginRight = '10px';

    const msgSliderValue = document.createElement('span');
    msgSliderValue.textContent = msgSlider.value;
    msgSliderValue.style.marginLeft = '10px';
    msgSliderValue.style.marginRight = '20px';

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.style.cssText = `
        padding: 5px 10px;
        background-color: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;

    bottomRow.appendChild(msgSliderLabel);
    bottomRow.appendChild(msgSlider);
    bottomRow.appendChild(msgSliderValue);
    bottomRow.appendChild(stopButton);

    statusBarContent.appendChild(topRow);
    statusBarContent.appendChild(middleRow);
    statusBarContent.appendChild(bottomRow);


    function getHKDate() {
        const now = new Date();
        return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
    }

    function isScriptValid() {
        const now = getHKDate();
        return now >= validFrom && now <= validTo;
    }

    // 立即檢查腳本是否有效
    if (!isScriptValid()) {
        const message = `腳本已過期或尚未生效。\n\n有效期：\n${validFrom.toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })} 至 \n${validTo.toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })}\n\n請聯繫開發者獲取最新版本。`;
        alert(message);
        return; // 如果腳本無效，立即退出
    }

    function toggleStatusBar() {
        isStatusBarExpanded = !isStatusBarExpanded;
        if (isStatusBarExpanded) {
            statusBar.style.height = '130px';
            toggleButton.textContent = '▲';
            statusBarContent.style.display = 'flex';
        } else {
            statusBar.style.height = '30px';
            toggleButton.textContent = '▼';
            statusBarContent.style.display = 'none';
        }
    }

    toggleButton.addEventListener('click', toggleStatusBar);

    function reloadPage() {
        if (isPageReloadEnabled) {
            location.reload();
        }
    }

    function updateCountdown() {
        if (isActive && isPageReloadEnabled) {
            const remainingTime = Math.ceil((nextReloadTime - Date.now()) / 1000);
            countdownText.textContent = `Next reload in: ${remainingTime}s`;
        } else {
            countdownText.textContent = isPageReloadEnabled ? 'Reload paused' : 'Page reload disabled';
        }
    }

    let reloadTimer;
    let nextReloadTime;

    function setReloadTimer() {
        clearInterval(reloadTimer);
        if (isActive && isPageReloadEnabled) {
            nextReloadTime = Date.now() + reloadInterval;
            updateCountdown();
            reloadTimer = setInterval(() => {
                updateCountdown();
                if (Date.now() >= nextReloadTime) {
                    reloadPage();
                    nextReloadTime = Date.now() + reloadInterval;
                }
            }, 1000);
        } else {
            updateCountdown();
        }
    }
    function addCustomButton_new() {
        const currentUrl = window.location.href;
        // if (currentUrl.includes('shows.cityline.com')) {
        if (currentUrl === targetURL_ENG||currentUrl === targetURL_TW||currentUrl === targetURL_CN||currentUrl.includes('shows.cityline.com')) {
            const targetSpan = document.querySelector('.purchaseTransportationBtn');
            if (targetSpan) {
                const customButton = document.createElement('div');
                customButton.innerHTML = `
                    <div style="
                        background-color: #F2AB1E;
                        color: black;
                        padding: 10px;
                        border-radius: 10px;
                        text-align: center;
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        margin-top: 10px;
                        cursor: pointer;
                        user-select: none;
                    ">
                        >HKTectBot提早進入排隊畫面功能<
                        <br>
                        請在開賣前1分鐘先好㩒此按鈕(過早㩒會被block)
                    </div>
                `;
                customButton.addEventListener('click', function() {
                    // alert('HKTectBot功能已啟動！正在嘗試進入購票流程。');
                    go_new();
                });
                targetSpan.parentNode.insertBefore(customButton, targetSpan.nextSibling);
            }
        } 
    }
    // 修改後的購票邏輯，跳過登錄檢查
    function go_new() {
        goPurchase_new();
    }

    function goPurchase_new() {
        const currentTime = getHKDate().getTime();
        const saleTime = Date.parse(_currEvent.content.onSaleTime);
        const saleEndTime = Date.parse(_currEvent.content.onSaleEnd);
        
        if (currentTime < saleTime || _currEvent.content.soldout || currentTime > saleEndTime) {
            //.log('Warning: Sale may not be active or tickets might be sold out, but continuing anyway.');
            alert('表演已經完結/過期或售罄。\nThe performance has already ended/expired or is sold out.');
        }
    
        let eventIdentifier = _currEvent.eventId + draftEnd;
        let onSaleTime = _currEvent.content.onSaleTime ? getHkDateMill(_currEvent.content.onSaleTime) : '';
        let purchaseURL = `https://shows.cityline.com/url/${_currEvent.eventYear}/${eventIdentifier}.${onSaleTime}.${simpleHash(eventIdentifier + onSaleTime + 'CiTy1ine')}.json?v=${getHKDate().getHours()}`;
    
        //console.log('Attempting to fetch purchase URL:', purchaseURL);
    
        $.get(purchaseURL, function(response, textStatus, xhr) {
            if (xhr.status == 200) {
                let eventUrl = '';
                if (response.additionalUrlList && response.additionalUrlList.length > 0) {
                    eventUrl = response.additionalUrlList[0].url;
                    //console.log('Using URL from additionalUrlList:', eventUrl);
                } else if (response.url) {
                    eventUrl = response.url;
                    //console.log('Using URL from response:', eventUrl);
                }
    
                if (eventUrl) {
                    //console.log('Redirecting to:', eventUrl);
                    window.location.href = eventUrl;
                } else {
                    //console.log('No valid URL found in the response.');
                    alert('無法獲取購票 URL。');
                }
            } else {
                //console.log('Server responded with status:', xhr.status);
                alert('門票尚未開啟請在售票日當日,一分鐘前按下Button。\nThe tickets are not yet available. Please press the button one minute before the ticket sale date.');
            }
        }).fail(function(error) {
            //console.log('Error fetching purchase URL:', error);
            alert('門票尚未開啟請在售票日當日,一分鐘前按下Button。\nThe tickets are not yet available. Please press the button one minute before the ticket sale date.');
        });
    }
    
    function updateRemainTime() {
        if (window.location.href.includes('msg.cityline.com')) {
            const remainTime1Span = document.getElementById('remainTime1');
            const retryButton = document.getElementById('btn-retry-en-1');
            
            if (remainTime1Span && retryButton) {
                let remainingSeconds = msgRetryInterval / 1000;

                function updateTimer() {
                    if (remainingSeconds > 0) {
                        remainTime1Span.textContent = ` (${remainingSeconds}s)`;
                        remainingSeconds--;
                        setTimeout(updateTimer, 1000);
                    } else {
                        remainTime1Span.textContent = '';
                        retryButton.disabled = false;
                        retryButton.click(); // Automatically click the retry button
                        remainingSeconds = msgRetryInterval / 1000; // Reset for the next retry
                        setTimeout(updateTimer, 1000); // Start the next countdown
                    }
                }

                updateTimer();
            }
        }
    }

    function addPageSpecificFeatures() {
        const currentUrl = window.location.href;

        if (currentUrl.includes('/eventDetail')) {
            addEventDetailFeatures();
        } else if (currentUrl.includes('/performance')) {
            addPerformanceFeatures();
        } else if (currentUrl.includes('/shoppingBasket')) {
            addShoppingBasketFeatures();
        }
    }

    function addEventDetailFeatures() {
        const buttonContainer = document.querySelector('.btn-buy-tickets');
        if (buttonContainer) {
            const autoSelectButton = createButton('自動選擇場次', autoSelectPerformance);
            buttonContainer.appendChild(autoSelectButton);
        }
    }

    function addPerformanceFeatures() {
        const priceDetailDiv = document.querySelector('div.price-detail.d-flex');
        if (priceDetailDiv) {
            const autoGrabButton = createButton('自動搶飛', autoGrabTicket);
            priceDetailDiv.parentNode.insertBefore(autoGrabButton, priceDetailDiv);
        }
    }

    function addShoppingBasketFeatures() {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            const autoSubmitButton = createButton('自動提交', () => submitButton.click());
            submitButton.parentNode.insertBefore(autoSubmitButton, submitButton);
        }
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            background-color: #F2AB1E;
            color: black;
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        `;
        button.addEventListener('click', onClick);
        return button;
    }

    function autoSelectPerformance() {
        const performanceLinks = document.querySelectorAll('a.performanceDateAnchor');
        if (performanceLinks.length > 0) {
            performanceLinks[0].click();
        } else {
            alert('沒有找到可選擇的場次。');
        }
    }

    function autoGrabTicket() {
        const priceBox = document.querySelector('.price-box1 .price');
        if (!priceBox) {
            alert('無法找到票價區塊。');
            return;
        }

        const availableTickets = Array.from(priceBox.querySelectorAll('.form-check'))
            .filter(ticket => {
                const radio = ticket.querySelector('input[type="radio"]');
                const soldOutSpan = ticket.querySelector('span[data-i18n="status-title-soldout"]');
                const tempNoSeatSpan = ticket.querySelector('span[data-i18n="HOLD_SEAT_PRICEZONE_TEMP_NO_SEAT"]');
                return radio && !radio.disabled && !soldOutSpan && !tempNoSeatSpan;
            });

        if (availableTickets.length === 0) {
            alert('沒有可用的票價選項。');
            return;
        }

        // 選擇第一個可用的票價
        const selectedTicket = availableTickets[0];
        const radio = selectedTicket.querySelector('input[type="radio"]');
        radio.checked = true;

        // 觸發 change 事件
        const event = new Event('change', { bubbles: true });
        radio.dispatchEvent(event);

        // 尋找確定按鈕
        const submitButton = document.getElementById('expressPurchaseBtn');
        if (submitButton) {
            // 清除之前的 interval（如果存在）
            if (clickInterval) {
                clearInterval(clickInterval);
            }

            // 開始連續點擊
            clickInterval = setInterval(() => {
                submitButton.click();
                checkPurchasePage();
            }, 500);

            // 添加停止按鈕
            const stopButton = document.createElement('button');
            stopButton.textContent = '停止自動點擊';
            stopButton.style.cssText = `
                position: fixed;
                top: 140px;
                right: 20px;
                z-index: 10000;
                background-color: #ff4444;
                color: white;
                border: none;
                padding: 10px;
                border-radius:
                border-radius: 5px;
                cursor: pointer;
            `;
            stopButton.onclick = () => {
                clearInterval(clickInterval);
                stopButton.remove();
                alert('自動點擊已停止');
            };
            document.body.appendChild(stopButton);
        } else {
            alert('無法找到確定按鈕。');
        }
    }

    function checkPurchasePage() {
        // 檢查是否進入購買畫面，這裡假設購買畫面有一個特定的元素
        const purchasePageElement = document.querySelector('.shopping-cart-page');
        if (purchasePageElement) {
            clearInterval(clickInterval);
            playAlertSound();
            showPopup();
        }
    }

    function playAlertSound() {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1084/1084-preview.mp3');  // 請替換為實際的音頻文件URL
        audio.play();
    }

    function showPopup() {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            z-index: 10001;
            text-align: center;
        `;
        popup.innerHTML = `
            <h2>成功進入購買畫面！</h2>
            <p>請盡快完成購票程序。</p>
            <button id="closePopup" style="
                margin-top: 10px;
                padding: 5px 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">關閉</button>
        `;
        document.body.appendChild(popup);

        document.getElementById('closePopup').onclick = () => {
            popup.remove();
        };
    }

    slider.addEventListener('input', function() {
        reloadInterval = this.value * 1000;
        sliderValue.textContent = this.value;
        if (isActive && isPageReloadEnabled) {
            setReloadTimer();
        }
    });

    msgSlider.addEventListener('input', function() {
        msgRetryInterval = this.value * 1000;
        msgSliderValue.textContent = this.value;
    });

    stopButton.addEventListener('click', function() {
        isActive = !isActive;
        this.textContent = isActive ? 'Stop' : 'Resume';
        this.style.backgroundColor = isActive ? '#ff4444' : '#44ff44';
        leftText.textContent = isActive ? 'Auto-reload active' : 'Auto-reload paused';
        setReloadTimer();
    });

    reloadCheckbox.addEventListener('change', function() {
        isPageReloadEnabled = this.checked;
        setReloadTimer();
        updateCountdown(); // Immediately update the countdown text
    });

    function initialSetup() {
        document.body.appendChild(statusBar);
        document.body.style.marginTop = '130px';
        setReloadTimer();
        addCustomButton_new();
        updateRemainTime();
        updateCountdown();
        addPageSpecificFeatures();
        // handlePurchaseButton(); // 新增這行

        // Add event listener to adjust body margin when status bar is toggled
        toggleButton.addEventListener('click', () => {
            document.body.style.marginTop = isStatusBarExpanded ? '130px' : '30px';
        });
    }

    // 在頁面加載完成後執行初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialSetup);
    } else {
        initialSetup();
    }
})();
