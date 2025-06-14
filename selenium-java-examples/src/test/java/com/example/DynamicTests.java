package com.example;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

public class DynamicTests {

    protected WebDriver driver;

    @BeforeEach
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "resources/chromedriver.exe");
        driver = new ChromeDriver();
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @TestFactory
    Collection<DynamicTest> dynamicTestsFromJson() throws Exception {

        // 1) Lecture du fichier
        ObjectMapper mapper = new ObjectMapper();
        TestData testData = mapper.readValue(
                new File("resources/accountFormWithStaticDatas.json"), TestData.class);

        // 2) Génération des tests
        return testData.getTestCases()
                .stream()
                .map(tc -> DynamicTest.dynamicTest(
                        tc.getTestCaseName(),
                        () -> runTest(testData.getPageLink(), tc)))
                .collect(Collectors.toList());
    }

    private void runTest(String pageLink, TestData.TestCase tc) {

        /* 1) Navigation */
        driver.get(pageLink);

        /* 2) Saisie des données */
        tc.getDatas().forEach((fieldId, value) -> {
            WebElement element = driver.findElement(By.id(fieldId));

            // <select> => Select, sinon sendKeys
            if ("select".equalsIgnoreCase(element.getTagName())) {
                new Select(element).selectByValue(String.valueOf(value));
            } else {
                element.clear();
                element.sendKeys(String.valueOf(value));
            }
        });

        /* 3) Vérification des attentes */
        tc.getExpectations().forEach(expectation -> expectation.forEach((testId, expected) -> {

            // On autorise id ou data-testid dans la page
            By locator = By.id(testId);
            List<WebElement> els = driver.findElements(locator);
            if (els.isEmpty()) {
                locator = By.cssSelector("[data-testid='" + testId + "']");
                els = driver.findElements(locator);
            }
            assertFalse(els.isEmpty(), "Élément introuvable : " + testId);

            WebElement el = els.get(0);

            switch (expected) {
                case "enabled":
                    assertTrue(el.isEnabled(), msg(testId, "devrait être activé"));
                    break;
                case "disabled":
                    assertFalse(el.isEnabled(), msg(testId, "devrait être désactivé"));
                    break;
                case "visible":
                    assertTrue(el.isDisplayed(), msg(testId, "devrait être visible"));
                    break;
                case "hidden":
                    assertFalse(el.isDisplayed(), msg(testId, "devrait être caché"));
                    break;
                default:
                    throw new IllegalArgumentException("État non pris en charge : " + expected);
            }
        }));
    }

    private String msg(String id, String txt) {
        return String.format("« %s » %s", id, txt);
    }

    /* ================ POJOs POUR JACKSON ================= */

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TestData {
        private String formName;
        private String pageLink;
        private List<Field> fields;
        private List<Action> actions;
        private List<TestCase> testCases;

        /* ---- Getters / setters ---- */
        public String getPageLink() {
            return pageLink;
        }

        public List<TestCase> getTestCases() {
            return testCases;
        }

        /* ---- Sous-objets ---- */
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Field {
            public String id, label, type;
            public boolean required;
            public List<String> options;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Action {
            public String id, label, defaultState;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class TestCase {
            private String testCaseName;
            private Map<String, Object> datas;
            private List<Map<String, String>> expectations;

            public String getTestCaseName() {
                return testCaseName;
            }

            public Map<String, Object> getDatas() {
                return datas == null ? Collections.emptyMap() : datas;
            }

            public List<Map<String, String>> getExpectations() {
                return expectations == null ? Collections.emptyList() : expectations;
            }
        }
    }
}
