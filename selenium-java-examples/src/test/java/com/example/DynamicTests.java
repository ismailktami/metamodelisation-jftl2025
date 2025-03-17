package com.example;

import com.example.utils.TestData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.util.Collection;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

public class DynamicTests extends SeleniumTest {

    @TestFactory
    Collection<DynamicTest> dynamicTestsFromJson() throws Exception {
        // Charger les données de test depuis le fichier JSON
        ObjectMapper objectMapper = new ObjectMapper();
        TestData testData = objectMapper.readValue(
                new File("resources/accountFormWithStaticDatas.json"), TestData.class);

        // Générer des tests dynamiques
        return testData.getTestCases().stream()
                .flatMap(testCase -> Stream.of(
                        dynamicTest(testCase.getTestCaseName(), () -> runTest(testData.getPageLink(), testCase))
                ))
                .collect(Collectors.toList());
    }

    private void runTest(String pageLink, TestData.TestCase testCase) {
        // Naviguer vers la page
        driver.get(pageLink);

        // Remplir les champs du formulaire
        testCase.getInputs().forEach((fieldId, value) -> {
            WebElement element = driver.findElement(By.id(fieldId));
            if ("select".equals(element.getTagName())) {
                // Gérer les listes déroulantes
                element.findElement(By.xpath(".//option[text()='" + value + "']")).click();
            } else {
                // Gérer les champs de texte
                element.clear();
                element.sendKeys(value);
            }
        });

        // Vérifier les attentes
        testCase.getExpectations().forEach(expectation -> {
            expectation.forEach((actionTestId, expectedState) -> {
                WebElement element = driver.findElement(By.cssSelector("[data-testid='" + actionTestId + "']"));
                switch (expectedState) {
                    case "visible":
                        assertTrue(element.isDisplayed(), "L'élément devrait être visible");
                        break;
                    case "hidden":
                        assertTrue(!element.isDisplayed(), "L'élément devrait être caché");
                        break;
                    case "enabled":
                        assertTrue(element.isEnabled(), "L'élément devrait être activé");
                        break;
                    case "disabled":
                        assertTrue(!element.isEnabled(), "L'élément devrait être désactivé");
                        break;
                    default:
                        throw new IllegalArgumentException("État non pris en charge : " + expectedState);
                }
            });
        });
    }
}
