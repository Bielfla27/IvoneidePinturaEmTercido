package br.com.gabrielfelix.ivoneide_pintura_api.order;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderResponse;

@RestController
@RequestMapping("/api/compras")
public class PurchaseController {

	private final OrderService orderService;

	public PurchaseController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping("/meu-historico")
	public ResponseEntity<List<OrderResponse>> findMyPurchaseHistory(Authentication authentication) {
		return ResponseEntity.ok(orderService.findMyPurchaseHistory(authentication.getName()));
	}
}
